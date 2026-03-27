import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserCheck, UserX, Trash2 } from 'lucide-react';

interface StoreListBatchActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBatchStatusUpdate: (status: 'active' | 'inactive' | 'pending') => void;
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
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              已選擇 {selectedCount} 個店家
            </span>
            <Button variant="outline" size="sm" onClick={onClearSelection}>
              取消選擇
            </Button>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserCheck className="h-4 w-4 mr-2" />
                  更改狀態
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onBatchStatusUpdate('active')}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  設為活躍
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBatchStatusUpdate('inactive')}>
                  <UserX className="h-4 w-4 mr-2" />
                  設為未啟用
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBatchStatusUpdate('pending')}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  設為待審核
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="destructive" size="sm" onClick={onBatchDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              批量刪除
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
