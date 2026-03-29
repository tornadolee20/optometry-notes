import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserCheck, UserX, Trash2 } from 'lucide-react';
import { AdminCard, AdminCardContent } from '@/components/admin/AdminCard';
import { AdminButton } from '@/components/admin/AdminButton';

interface StoreListBatchActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBatchStatusUpdate: (status: 'active' | 'suspended' | 'pending') => void;
  onBatchDelete: () => void;
}

export const StoreListBatchActions: React.FC<StoreListBatchActionsProps> = ({
  selectedCount,
  onClearSelection,
  onBatchStatusUpdate,
  onBatchDelete
}) => {
  if (selectedCount === 0) return null;

  return (
    <AdminCard className="mb-6 border-primary/20 bg-primary/5">
      <AdminCardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-foreground">
              已選擇 {selectedCount} 個店家
            </span>
            <AdminButton variant="outline" size="sm" onClick={onClearSelection}>
              取消選擇
            </AdminButton>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <AdminButton variant="outline" size="sm" icon={UserCheck}>
                  更改狀態
                </AdminButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onBatchStatusUpdate('active')}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  設為活躍
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBatchStatusUpdate('suspended')}>
                  <UserX className="h-4 w-4 mr-2" />
                  設為停用
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBatchStatusUpdate('pending')}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  設為待審核
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <AdminButton variant="danger" size="sm" icon={Trash2} onClick={onBatchDelete}>
              批量刪除
            </AdminButton>
          </div>
        </div>
      </AdminCardContent>
    </AdminCard>
  );
};
