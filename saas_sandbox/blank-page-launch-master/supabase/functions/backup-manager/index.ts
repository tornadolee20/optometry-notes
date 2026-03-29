import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BackupRequest {
  backup_type: 'manual' | 'emergency' | 'automatic'
  backup_name?: string
  include_audit_logs?: boolean
}

interface RestoreRequest {
  backup_id: string
  restore_type: 'full' | 'selective'
  tables?: string[]
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    console.log(`Backup Manager: ${action} action requested`)

    switch (action) {
      case 'create_backup':
        return await createBackup(req, supabase)
      case 'list_backups':
        return await listBackups(supabase)
      case 'restore_backup':
        return await restoreBackup(req, supabase)
      case 'download_backup':
        return await downloadBackup(req, supabase)
      case 'cleanup_old_backups':
        return await cleanupOldBackups(supabase)
      case 'get_audit_trail':
        return await getAuditTrail(req, supabase)
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Backup Manager Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function createBackup(req: Request, supabase: any) {
  const requestData: BackupRequest = await req.json()
  
  console.log('Creating backup:', requestData)
  
  // Generate backup metadata
  const backupId = crypto.randomUUID()
  const timestamp = new Date().toISOString()
  const backupName = requestData.backup_name || 
    `${requestData.backup_type}-backup-${timestamp.split('T')[0]}`

  // Start background backup process
  EdgeRuntime.waitUntil(performBackupProcess(backupId, requestData, supabase))

  // Create backup record
  const { data: backup, error: backupError } = await supabase
    .from('system_backups')
    .insert({
      id: backupId,
      backup_name: backupName,
      backup_type: requestData.backup_type,
      backup_status: 'in_progress',
      created_by: null, // System created
      backup_metadata: {
        include_audit_logs: requestData.include_audit_logs || false,
        created_at: timestamp,
        request_type: requestData.backup_type
      }
    })
    .select()
    .single()

  if (backupError) {
    console.error('Error creating backup record:', backupError)
    throw backupError
  }

  return new Response(
    JSON.stringify({
      success: true,
      backup_id: backupId,
      backup_name: backupName,
      status: 'initiated',
      message: 'Backup process started'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function performBackupProcess(backupId: string, request: BackupRequest, supabase: any) {
  try {
    console.log(`Starting backup process for ${backupId}`)
    
    // Get critical data using the database function
    const { data: criticalData, error: dataError } = await supabase
      .rpc('get_critical_backup_data')

    if (dataError) {
      console.error('Error getting critical data:', dataError)
      throw dataError
    }

    // Create backup file content
    const backupContent = {
      backup_id: backupId,
      created_at: new Date().toISOString(),
      backup_type: request.backup_type,
      version: '1.0',
      data: criticalData
    }

    // Include audit logs if requested
    if (request.include_audit_logs) {
      const { data: auditData, error: auditError } = await supabase
        .from('subscription_audit_log')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(1000)

      if (!auditError) {
        backupContent.audit_logs = auditData
      }
    }

    // Upload backup to storage
    const fileName = `backup-${backupId}-${new Date().toISOString().split('T')[0]}.json`
    const { error: uploadError } = await supabase.storage
      .from('system-backups')
      .upload(fileName, JSON.stringify(backupContent, null, 2), {
        contentType: 'application/json'
      })

    if (uploadError) {
      console.error('Error uploading backup:', uploadError)
      throw uploadError
    }

    // Calculate file size
    const fileSize = new Blob([JSON.stringify(backupContent)]).size

    // Update backup record
    const { error: updateError } = await supabase
      .from('system_backups')
      .update({
        backup_status: 'completed',
        completed_at: new Date().toISOString(),
        file_path: fileName,
        file_size: fileSize,
        verification_checksum: await generateChecksum(JSON.stringify(backupContent))
      })
      .eq('id', backupId)

    if (updateError) {
      console.error('Error updating backup record:', updateError)
      throw updateError
    }

    console.log(`Backup process completed for ${backupId}`)
  } catch (error) {
    console.error(`Backup process failed for ${backupId}:`, error)
    
    // Mark backup as failed
    await supabase
      .from('system_backups')
      .update({
        backup_status: 'failed',
        completed_at: new Date().toISOString(),
        backup_metadata: {
          error: error.message,
          failed_at: new Date().toISOString()
        }
      })
      .eq('id', backupId)
  }
}

async function listBackups(supabase: any) {
  const { data: backups, error } = await supabase
    .from('system_backups')
    .select(`
      id,
      backup_name,
      backup_type,
      backup_status,
      file_size,
      created_at,
      completed_at,
      expires_at,
      backup_metadata
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error listing backups:', error)
    throw error
  }

  return new Response(
    JSON.stringify({
      success: true,
      backups: backups || []
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function restoreBackup(req: Request, supabase: any) {
  const requestData: RestoreRequest = await req.json()
  
  console.log('Restore request:', requestData)
  
  // Get backup data
  const { data: backup, error: backupError } = await supabase
    .from('system_backups')
    .select('*')
    .eq('id', requestData.backup_id)
    .single()

  if (backupError || !backup) {
    return new Response(
      JSON.stringify({ error: 'Backup not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // For demo purposes, we'll simulate restore validation
  return new Response(
    JSON.stringify({
      success: true,
      message: 'Restore process would be initiated',
      backup_info: {
        name: backup.backup_name,
        created_at: backup.created_at,
        type: backup.backup_type
      },
      warning: 'This is a simulation - actual restore requires manual intervention'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function downloadBackup(req: Request, supabase: any) {
  const url = new URL(req.url)
  const backupId = url.searchParams.get('backup_id')
  
  if (!backupId) {
    return new Response(
      JSON.stringify({ error: 'backup_id required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: backup, error } = await supabase
    .from('system_backups')
    .select('file_path, backup_name')
    .eq('id', backupId)
    .single()

  if (error || !backup) {
    return new Response(
      JSON.stringify({ error: 'Backup not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: fileData, error: downloadError } = await supabase.storage
    .from('system-backups')
    .download(backup.file_path)

  if (downloadError) {
    return new Response(
      JSON.stringify({ error: 'Failed to download backup file' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(fileData, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${backup.backup_name}.json"`
    }
  })
}

async function cleanupOldBackups(supabase: any) {
  // Get retention setting
  const { data: settings } = await supabase
    .from('system_settings')
    .select('setting_value')
    .eq('setting_key', 'backup_retention_days')
    .single()

  const retentionDays = settings?.setting_value?.days || 30
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  // Mark old backups as expired
  const { data: expiredBackups, error: expireError } = await supabase
    .from('system_backups')
    .update({ backup_status: 'expired' })
    .lt('created_at', cutoffDate.toISOString())
    .eq('backup_status', 'completed')
    .select('id, file_path')

  if (expireError) {
    console.error('Error marking backups as expired:', expireError)
    throw expireError
  }

  // Delete expired backup files from storage
  let deletedCount = 0
  if (expiredBackups) {
    for (const backup of expiredBackups) {
      if (backup.file_path) {
        const { error: deleteError } = await supabase.storage
          .from('system-backups')
          .remove([backup.file_path])
        
        if (!deleteError) {
          deletedCount++
        }
      }
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      expired_backups: expiredBackups?.length || 0,
      deleted_files: deletedCount,
      retention_days: retentionDays
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getAuditTrail(req: Request, supabase: any) {
  const url = new URL(req.url)
  const storeId = url.searchParams.get('store_id')
  const limit = parseInt(url.searchParams.get('limit') || '100')
  
  const queries = []
  
  // Get subscription audit logs
  if (storeId) {
    queries.push(
      supabase
        .from('subscription_audit_log')
        .select('*')
        .eq('store_id', storeId)
        .order('changed_at', { ascending: false })
        .limit(limit)
    )
  } else {
    queries.push(
      supabase
        .from('subscription_audit_log')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(limit)
    )
  }

  const [subscriptionLogs] = await Promise.all(queries)
  
  return new Response(
    JSON.stringify({
      success: true,
      audit_logs: {
        subscription_changes: subscriptionLogs.data || []
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function generateChecksum(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}