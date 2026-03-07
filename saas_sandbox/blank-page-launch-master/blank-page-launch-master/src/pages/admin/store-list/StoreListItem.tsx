import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, UserCheck, UserX, Gift, Clock, Crown, AlertTriangle } from 'lucide-react';
import { 
  Store, 
  getStatusColor, 
  getStatusText, 
  getSubscriptionStatusColor, 
  getSubscriptionStatusText,
  getSubscriptionIconName,
  formatTimeLeft 
} from './storeListUtils';

interface StoreListItemProps {
  store: Store;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onStatusUpdate: (status: 'active' | 'inactive' | 'pending') => void;
  onDelete: () => void;
  onGrantSubscription: () => void;
}

const SubscriptionIcon: React.FC<{ iconName: string }> = ({ iconName }) => {
  switch (iconName) {
    case 'gift':
      return <Gift className="w-3 h-3" />;
    case 'crown':
      return <Crown className="w-3 h-3" />;
    case 'alert':
      return <AlertTriangle className="w-3 h-3" />;
    default:
      return <Clock className="w-3 h-3" />;
  }
};

export const StoreListItem: React.FC<StoreListItemProps> = ({
  store,
  isSelected,
  onSelect,
  onStatusUpdate,
  onDelete,
  onGrantSubscription
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(!!checked)}
          />
          
          <Link to={`/store/${store.id}`} target="_blank" rel="noopener noreferrer" className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-blue-600 hover:underline">
                    {store.store_name}
                  </h3>
                  <Badge className={getStatusColor(store.status)}>
                    {getStatusText(store.status)}
                  </Badge>
                  {store.industry && (
                    <Badge variant="outline">{store.industry}</Badge>
                  )}
                  {store.subscription ? (
                    <Badge className={`${getSubscriptionStatusColor(store.subscription.status)} flex items-center gap-1`}>
                      <SubscriptionIcon iconName={getSubscriptionIconName(store.subscription.status)} />
                      {getSubscriptionStatusText(store.subscription.status)}
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-600 border-gray-200 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      未訂閱
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-gray-600">
                  <div>Email: {store.email}</div>
                  <div>編號: {String(store.store_number).padStart(5, '0')}</div>
                  <div>建立日期: {new Date(store.created_at).toLocaleDateString('zh-TW')}</div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {store.subscription ? (
                      <span className={`${
                        store.subscription.days_left <= 3 ? 'text-red-600 font-medium' :
                        store.subscription.days_left <= 7 ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {formatTimeLeft(store.subscription.days_left)}
                      </span>
                    ) : (
                      <span className="text-gray-500">無訂閱</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/admin/store/${store.id}`}>檢視詳情</Link>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/admin/store/${store.id}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    編輯
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-blue-600" onClick={onGrantSubscription}>
                  <Gift className="h-4 w-4 mr-2" />
                  授予免費訂閱
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-green-600" onClick={() => onStatusUpdate('active')}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  設為活躍
                </DropdownMenuItem>
                <DropdownMenuItem className="text-yellow-600" onClick={() => onStatusUpdate('pending')}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  設為待審核
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={() => onStatusUpdate('inactive')}>
                  <UserX className="h-4 w-4 mr-2" />
                  設為未啟用
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  刪除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
