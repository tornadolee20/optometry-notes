import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, UserCheck, UserX, Gift, Clock, Crown, AlertTriangle, ExternalLink, ArrowRightLeft } from 'lucide-react';
import { AdminCard } from '@/components/admin/AdminCard';
import { isSandboxStore } from '@/config/sandbox';
import { 
  Store, 
  getStatusColor, 
  getStatusText, 
  getSubscriptionStatusColor, 
  getSubscriptionStatusText,
  getSubscriptionIconName,
  formatTimeLeft 
} from './storeListUtils';
import { cn } from '@/lib/utils';

interface StoreListItemProps {
  store: Store;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onStatusUpdate: (status: 'active' | 'suspended' | 'pending') => void;
  onDelete: () => void;
  onGrantSubscription: () => void;
  onTransferOwnership: () => void;
}

const SubscriptionIcon: React.FC<{ iconName: string }> = ({ iconName }) => {
  switch (iconName) {
    case 'gift': return <Gift className="w-3 h-3" />;
    case 'crown': return <Crown className="w-3 h-3" />;
    case 'alert': return <AlertTriangle className="w-3 h-3" />;
    default: return <Clock className="w-3 h-3" />;
  }
};

export const StoreListItem: React.FC<StoreListItemProps> = ({
  store,
  isSelected,
  onSelect,
  onStatusUpdate,
  onDelete,
  onGrantSubscription,
  onTransferOwnership
}) => {
  return (
    <AdminCard className={cn(
      "p-0 transition-all duration-200",
      isSelected && "ring-1 ring-primary/30 bg-primary/[0.02]"
    )}>
      <div className="p-4 flex items-start gap-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(!!checked)}
          className="mt-1"
        />
        
        <div className="flex-1 min-w-0">
          {/* Top row: name + badges */}
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <Link to={`/store/${store.id}`} className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
              {store.store_name}
            </Link>
            {isSandboxStore(store.email) && (
              <Badge className="text-[10px] h-4 px-1.5 bg-violet-500/10 text-violet-700 border-violet-500/20">
                🧪 測試沙盒
              </Badge>
            )}
            <Badge className={cn(getStatusColor(store.status), "text-[10px] h-4 px-1.5")}>
              {getStatusText(store.status)}
            </Badge>
            {store.industry && (
              <Badge variant="outline" className="text-[10px] h-4 px-1.5">{store.industry}</Badge>
            )}
            {store.subscription ? (
              <Badge className={cn(getSubscriptionStatusColor(store.subscription.status), "text-[10px] h-4 px-1.5 flex items-center gap-0.5")}>
                <SubscriptionIcon iconName={getSubscriptionIconName(store.subscription.status)} />
                {getSubscriptionStatusText(store.subscription.status)}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">未訂閱</Badge>
            )}
          </div>

          {/* Info row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <span>{store.email}</span>
            <span className="text-muted-foreground/40">·</span>
            <span>#{String(store.store_number).padStart(5, '0')}</span>
            <span className="text-muted-foreground/40">·</span>
            <span>{new Date(store.created_at).toLocaleDateString('zh-TW')}</span>
            {store.line_id && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-primary">LINE: {store.line_id}</span>
              </>
            )}
            {store.subscription && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className={cn(
                  store.subscription.days_left <= 3 ? 'text-destructive font-medium' :
                  store.subscription.days_left <= 7 ? 'text-amber-600' :
                  'text-emerald-600'
                )}>
                  {formatTimeLeft(store.subscription.days_left)}
                </span>
              </>
            )}
          </div>

          {/* Tags & Notes row */}
          {((store.tags && store.tags.length > 0) || store.notes) && (
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {store.tags?.map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-[10px] h-4 px-1.5">{tag}</Badge>
              ))}
              {store.notes && (
                <span className="text-[10px] text-muted-foreground/70 truncate max-w-[200px]" title={store.notes}>
                  📝 {store.notes}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button variant="ghost" size="sm" className="h-7 text-xs px-2.5" asChild>
            <Link to={`/store/${store.id}`}>
              詳情 <ExternalLink className="h-3 w-3 ml-1" />
            </Link>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild>
                <Link to={`/store/${store.id}`}>
                  <Edit className="h-3.5 w-3.5 mr-2" />
                  編輯
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onGrantSubscription}>
                <Gift className="h-3.5 w-3.5 mr-2" />
                授予免費訂閱
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onTransferOwnership}>
                <ArrowRightLeft className="h-3.5 w-3.5 mr-2" />
                轉移管理權
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onStatusUpdate('active')}>
                <UserCheck className="h-3.5 w-3.5 mr-2" />
                設為活躍
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusUpdate('pending')}>
                <Clock className="h-3.5 w-3.5 mr-2" />
                設為待審核
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusUpdate('suspended')}>
                <UserX className="h-3.5 w-3.5 mr-2" />
                設為停用
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                刪除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </AdminCard>
  );
};
