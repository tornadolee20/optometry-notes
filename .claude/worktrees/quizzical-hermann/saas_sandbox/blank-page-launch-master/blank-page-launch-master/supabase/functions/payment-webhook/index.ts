import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
}

// Webhook 安全驗證類
class WebhookSecurity {
  private static webhookSecret = Deno.env.get('WEBHOOK_SECRET_KEY') || ''

  /**
   * 驗證 Webhook 簽名
   */
  static async verifySignature(
    payload: string,
    signature: string,
    timestamp: string
  ): Promise<boolean> {
    try {
      if (!this.webhookSecret) {
        console.error('WEBHOOK_SECRET_KEY 環境變數未設置')
        return false
      }

      // 檢查時間戳（防止重放攻擊）
      const webhookTimestamp = parseInt(timestamp)
      const currentTime = Math.floor(Date.now() / 1000)
      const timeDifference = Math.abs(currentTime - webhookTimestamp)
      
      // 5 分鐘內的請求才有效
      if (timeDifference > 300) {
        console.error('Webhook 時間戳過期')
        return false
      }

      // 構建簽名字符串
      const signaturePayload = `${timestamp}.${payload}`
      
      // 使用 HMAC-SHA256 計算簽名
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(this.webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )

      const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(signaturePayload)
      )

      // 轉換為十六進制
      const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      // 比較簽名（防止時序攻擊）
      return this.secureCompare(`sha256=${expectedSignature}`, signature)

    } catch (error) {
      console.error('簽名驗證失敗:', error)
      return false
    }
  }

  /**
   * 安全比較字符串（防止時序攻擊）
   */
  private static secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false
    }

    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }
    
    return result === 0
  }

  /**
   * 防止重放攻擊的 nonce 檢查
   */
  static async checkNonce(supabaseClient: any, nonce: string): Promise<boolean> {
    try {
      // 檢查 nonce 是否已使用
      const { data: existingNonce } = await supabaseClient
        .from('webhook_nonces')
        .select('id')
        .eq('nonce', nonce)
        .single()

      if (existingNonce) {
        console.error('Webhook nonce 已被使用')
        return false
      }

      // 記錄新的 nonce
      await supabaseClient
        .from('webhook_nonces')
        .insert({
          nonce,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5分鐘後過期
        })

      return true
    } catch (error) {
      console.error('Nonce 檢查失敗:', error)
      return false
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // 獲取原始請求體和標頭
    const rawPayload = await req.text()
    const signature = req.headers.get('x-webhook-signature') || ''
    const timestamp = req.headers.get('x-webhook-timestamp') || ''
    const nonce = req.headers.get('x-webhook-nonce') || ''

    console.log('Webhook 安全檢查開始...')

    // 1. 驗證必要的安全標頭
    if (!signature || !timestamp) {
      console.error('缺少必要的安全標頭')
      return new Response(
        JSON.stringify({ error: 'Missing security headers' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        },
      )
    }

    // 2. 驗證 Webhook 簽名
    const isValidSignature = await WebhookSecurity.verifySignature(
      rawPayload,
      signature,
      timestamp
    )

    if (!isValidSignature) {
      console.error('Webhook 簽名驗證失敗')
      return new Response(
        JSON.stringify({ error: 'Invalid webhook signature' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        },
      )
    }

    // 3. 檢查 nonce（防止重放攻擊）
    if (nonce) {
      const isValidNonce = await WebhookSecurity.checkNonce(supabaseClient, nonce)
      if (!isValidNonce) {
        console.error('Webhook nonce 驗證失敗')
        return new Response(
          JSON.stringify({ error: 'Invalid or duplicate nonce' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401,
          },
        )
      }
    }

    console.log('Webhook 安全驗證通過')

    // 解析 webhook 請求
    const payload = JSON.parse(rawPayload)
    console.log('Payment webhook received:', payload)

    const { 
      event_type, 
      payment_data, 
      customer_data, 
      subscription_data 
    } = payload

    switch (event_type) {
      case 'payment.succeeded':
        await handlePaymentSuccess(supabaseClient, payment_data, customer_data, subscription_data)
        break
      
      case 'payment.failed':
        await handlePaymentFailure(supabaseClient, payment_data, customer_data)
        break
      
      case 'subscription.canceled':
        await handleSubscriptionCanceled(supabaseClient, subscription_data)
        break
      
      default:
        console.log('未處理的事件類型:', event_type)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

async function handlePaymentSuccess(supabaseClient: any, paymentData: any, customerData: any, subscriptionData: any) {
  try {
    console.log('處理付款成功事件')
    
    // 1. 創建或更新用戶帳號
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email: customerData.email,
      password: generateRandomPassword(),
      email_confirm: true,
      user_metadata: {
        name: customerData.holderName,
        phone: customerData.phone,
        payment_method: 'credit_card'
      }
    })

    if (authError) {
      console.error('創建用戶失敗:', authError)
      throw authError
    }

    const userId = authData.user.id

    // 2. 創建店家記錄
    const { data: storeData, error: storeError } = await supabaseClient
      .from('stores')
      .insert({
        user_id: userId,
        name: `${customerData.holderName}的店家`,
        description: '透過 ReviewQuickly 建立的店家',
        address: '',
        phone: customerData.phone || '',
        status: 'active'
      })
      .select()
      .single()

    if (storeError) {
      console.error('創建店家失敗:', storeError)
      throw storeError
    }

    // 3. 創建訂閱記錄
    const now = new Date()
    const expiresAt = new Date()
    
    if (subscriptionData.planType === 'basic') {
      expiresAt.setFullYear(now.getFullYear() + 10) // 免費方案長期有效
    } else {
      expiresAt.setMonth(now.getMonth() + 1) // 付費方案一個月
    }

    const { data: subscription, error: subscriptionError } = await supabaseClient
      .from('store_subscriptions')
      .insert({
        store_id: storeData.id,
        plan_type: subscriptionData.planType,
        status: 'active',
        expires_at: expiresAt.toISOString(),
        auto_renew: subscriptionData.planType !== 'basic',
        features: {
          limits: getPlanLimits(subscriptionData.planType),
          paymentHistory: [paymentData],
          customerData: customerData
        }
      })
      .select()
      .single()

    if (subscriptionError) {
      console.error('創建訂閱失敗:', subscriptionError)
      throw subscriptionError
    }

    // 4. 記錄活動日誌
    await supabaseClient
      .from('activity_logs')
      .insert({
        entity_type: 'payment',
        entity_id: storeData.id,
        activity_type: 'payment_succeeded',
        details: {
          transactionId: paymentData.transactionId,
          amount: paymentData.amount,
          planType: subscriptionData.planType,
          subscriptionId: subscription.id
        },
        performed_by: 'system'
      })

    // 5. 發送歡迎郵件 (可選)
    console.log('用戶設置完成:', {
      userId,
      storeId: storeData.id,
      subscriptionId: subscription.id,
      planType: subscriptionData.planType
    })

  } catch (error) {
    console.error('處理付款成功事件錯誤:', error)
    throw error
  }
}

async function handlePaymentFailure(supabaseClient: any, paymentData: any, customerData: any) {
  try {
    console.log('處理付款失敗事件')
    
    // 記錄付款失敗
    await supabaseClient
      .from('activity_logs')
      .insert({
        entity_type: 'payment',
        entity_id: null,
        activity_type: 'payment_failed',
        details: {
          transactionId: paymentData.transactionId,
          failureReason: paymentData.failureReason,
          customerEmail: customerData.email
        },
        performed_by: 'system'
      })

  } catch (error) {
    console.error('處理付款失敗事件錯誤:', error)
    throw error
  }
}

async function handleSubscriptionCanceled(supabaseClient: any, subscriptionData: any) {
  try {
    console.log('處理訂閱取消事件')
    
    // 更新訂閱狀態
    const { error } = await supabaseClient
      .from('store_subscriptions')
      .update({ 
        status: 'canceled',
        auto_renew: false 
      })
      .eq('id', subscriptionData.subscriptionId)

    if (error) {
      console.error('更新訂閱狀態失敗:', error)
      throw error
    }

    // 記錄取消活動
    await supabaseClient
      .from('activity_logs')
      .insert({
        entity_type: 'subscription',
        entity_id: subscriptionData.storeId,
        activity_type: 'subscription_canceled',
        details: {
          subscriptionId: subscriptionData.subscriptionId,
          cancelReason: subscriptionData.cancelReason
        },
        performed_by: 'system'
      })

  } catch (error) {
    console.error('處理訂閱取消事件錯誤:', error)
    throw error
  }
}

function generateRandomPassword(): string {
  const length = 12
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  
  return password
}

function getPlanLimits(planType: string) {
  const limits = {
    basic: {
      monthlyReviews: 10,
      keywords: 20,
      analytics: false,
      apiAccess: false,
      prioritySupport: false,
      customization: false
    },
    premium: {
      monthlyReviews: 100,
      keywords: 100,
      analytics: true,
      apiAccess: false,
      prioritySupport: true,
      customization: false
    },
    enterprise: {
      monthlyReviews: -1, // 無限制
      keywords: -1, // 無限制
      analytics: true,
      apiAccess: true,
      prioritySupport: true,
      customization: true
    }
  }
  
  return limits[planType as keyof typeof limits] || limits.basic
}