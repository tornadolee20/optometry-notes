
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AdminStoreView: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToStoreDashboard = async () => {
      if (!storeId) return;

      try {
        // Get store number to redirect to store dashboard
        const { data, error } = await supabase
          .from('stores')
          .select('store_number')
          .eq('id', storeId)
          .single();

        if (error) {
          console.error('Error fetching store:', error);
          return;
        }

        if (data) {
          // Redirect to store dashboard using store UUID
          navigate(`/store/${storeId}`);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    redirectToStoreDashboard();
  }, [storeId, navigate]);

  // Show loading while redirecting
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center">
        <div className="animate-pulse">
          <p>正在跳轉到店家儀表板...</p>
        </div>
      </div>
    </div>
  );
};

export default AdminStoreView;
