import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';
import { 
  FileText, Shield, Settings, Send, ClipboardList, Layers, AlertTriangle
} from 'lucide-react';
import { ActivityLogsTab } from '@/components/admin/ActivityLogsTab';
import { SystemSettingsTab } from '@/components/admin/SystemSettingsTab';
import { PermissionsTab } from '@/components/admin/PermissionsTab';
import { IndustryTemplatesTab } from '@/components/admin/IndustryTemplatesTab';
import { IndustryRequestsTab } from '@/components/admin/IndustryRequestsTab';
import { FrontendErrorLogsTab } from '@/components/admin/FrontendErrorLogsTab';
import { TelegramAlertSettingsTab } from '@/components/admin/TelegramAlertSettingsTab';

const SystemManagement: React.FC = () => {
  return (
    <AdminPageWrapper>
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">系統管理</h1>
        <p className="text-sm text-muted-foreground mt-0.5">活動日誌、系統設定、權限管理、產業需求與模板</p>
      </div>

      <Tabs defaultValue="logs" className="space-y-5">
        <TabsList className="bg-muted/50 p-1 h-auto flex-wrap">
          <TabsTrigger value="logs" className="flex items-center gap-1.5 text-xs data-[state=active]:shadow-sm px-4 py-2">
            <FileText className="h-3.5 w-3.5" />
            活動日誌
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1.5 text-xs data-[state=active]:shadow-sm px-4 py-2">
            <Settings className="h-3.5 w-3.5" />
            系統設定
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-1.5 text-xs data-[state=active]:shadow-sm px-4 py-2">
            <Shield className="h-3.5 w-3.5" />
            權限管理
          </TabsTrigger>
          <TabsTrigger value="industry-requests" className="flex items-center gap-1.5 text-xs data-[state=active]:shadow-sm px-4 py-2">
            <ClipboardList className="h-3.5 w-3.5" />
            產業需求
          </TabsTrigger>
          <TabsTrigger value="industry-templates" className="flex items-center gap-1.5 text-xs data-[state=active]:shadow-sm px-4 py-2">
            <Layers className="h-3.5 w-3.5" />
            產業模板
          </TabsTrigger>
          <TabsTrigger value="error-logs" className="flex items-center gap-1.5 text-xs data-[state=active]:shadow-sm px-4 py-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            錯誤日誌
          </TabsTrigger>
          <TabsTrigger value="telegram" className="flex items-center gap-1.5 text-xs data-[state=active]:shadow-sm px-4 py-2">
            <Send className="h-3.5 w-3.5" />
            Telegram 告警
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs"><ActivityLogsTab /></TabsContent>
        <TabsContent value="settings"><SystemSettingsTab /></TabsContent>
        <TabsContent value="permissions"><PermissionsTab /></TabsContent>
        <TabsContent value="industry-requests"><IndustryRequestsTab /></TabsContent>
        <TabsContent value="industry-templates"><IndustryTemplatesTab /></TabsContent>
        <TabsContent value="error-logs"><FrontendErrorLogsTab /></TabsContent>
        <TabsContent value="telegram"><TelegramAlertSettingsTab /></TabsContent>
      </Tabs>
    </AdminPageWrapper>
  );
};

export default SystemManagement;
