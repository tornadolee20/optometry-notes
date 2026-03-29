
import type { Store } from "@/types/store";

interface StoreHeaderProps {
  store: Store;
}

export const StoreHeader = ({ store }: StoreHeaderProps) => {
  return (
    <div className="text-center space-y-2 py-4 sm:py-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight px-2">
        {store.store_name}
      </h1>
    </div>
  );
};
