import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, X, MapPin, ExternalLink } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const SUPABASE_URL = "https://wfaqnahahygtieyjnlji.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmYXFuYWhhaHlndGlleWpubGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NTU0NDUsImV4cCI6MjA3MDAzMTQ0NX0.0LuFBd95M0Wge9Oj6jfWAsNTd5FFEh1Tj52t0NtnQBo";

interface GooglePlace {
  placeId: string;
  description: string;
  structuredFormatting?: {
    main_text: string;
    secondary_text: string;
  };
}

interface GoogleReviewLinkPickerProps {
  currentUrl?: string;
  onUrlChange: (url: string) => void;
}

export const GoogleReviewLinkPicker = ({ currentUrl, onUrlChange }: GoogleReviewLinkPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GooglePlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingDetails, setIsGettingDetails] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<GooglePlace | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // 清理搜尋建議
  const clearSuggestions = () => {
    setSuggestions([]);
    setSelectedPlace(null);
  };

  // 搜尋商家
  const searchPlaces = async (query: string) => {
    if (!query.trim() || query.trim().length < 2) {
      clearSuggestions();
      return;
    }

    setIsSearching(true);
    try {
      const url = new URL(`${SUPABASE_URL}/functions/v1/google-places-search`);
      url.searchParams.set('action', 'search');
      
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          query: query.trim(),
          sessionToken: crypto.randomUUID()
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('HTTP error:', response.status, data);
        toast({
          variant: "destructive",
          title: "搜尋失敗",
          description: "無法搜尋商家，請稍後再試",
        });
        return;
      }

      if (data?.error) {
        console.error('Google Places API error:', data.error);
        toast({
          variant: "destructive",
          title: "搜尋失敗", 
          description: data.error,
        });
        return;
      }

      setSuggestions(data?.suggestions || []);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        variant: "destructive",
        title: "搜尋錯誤",
        description: "發生未預期的錯誤",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // 取得商家詳細資訊和評論連結
  const getPlaceDetails = async (place: GooglePlace) => {
    setIsGettingDetails(true);
    setSelectedPlace(place);

    try {
      const url = new URL(`${SUPABASE_URL}/functions/v1/google-places-search`);
      url.searchParams.set('action', 'details');
      
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          placeId: place.placeId
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('HTTP error:', response.status, data);
        toast({
          variant: "destructive",
          title: "取得連結失敗",
          description: "無法取得評論連結，請稍後再試",
        });
        return;
      }

      if (data?.error) {
        console.error('Google Places Details API error:', data.error);
        toast({
          variant: "destructive",
          title: "取得連結失敗",
          description: data.error,
        });
        return;
      }

      if (data?.reviewUrl) {
        onUrlChange(data.reviewUrl);
        toast({
          title: "成功",
          description: `已設定 ${data.place?.name} 的評論連結`,
        });
        setIsOpen(false);
        clearSuggestions();
        setSearchQuery("");
      }
    } catch (error) {
      console.error('Get details error:', error);
      toast({
        variant: "destructive",
        title: "取得連結錯誤",
        description: "發生未預期的錯誤",
      });
    } finally {
      setIsGettingDetails(false);
      setSelectedPlace(null);
    }
  };

  // 處理搜尋輸入變化
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    // 清除之前的計時器
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // 設定新的計時器，延遲 300ms 後搜尋
    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(value);
    }, 300);
  };

  // 清理計時器
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // 轉換現有連結格式
  const convertExistingUrl = () => {
    if (!currentUrl) return;

    try {
      // 檢查是否已經是標準格式
      if (currentUrl.includes('search.google.com/local/writereview?placeid=')) {
        toast({
          title: "提示",
          description: "連結已經是標準的 Google 評論連結格式",
        });
        return;
      }

      // 嘗試從各種 Google 連結格式中提取 Place ID
      const placeIdPatterns = [
        /place_id=([a-zA-Z0-9_-]+)/,
        /data=.*!1s([a-zA-Z0-9_-]+)/,
        /places\/([a-zA-Z0-9_-]+)/,
        /cid=(\d+)/
      ];

      let placeId = null;
      for (const pattern of placeIdPatterns) {
        const match = currentUrl.match(pattern);
        if (match) {
          placeId = match[1];
          break;
        }
      }

      if (placeId) {
        const standardUrl = `https://search.google.com/local/writereview?placeid=${placeId}`;
        onUrlChange(standardUrl);
        toast({
          title: "成功",
          description: "已轉換為標準的 Google 評論連結格式",
        });
      } else {
        toast({
          variant: "destructive",
          title: "轉換失敗",
          description: "無法從此連結中提取 Place ID，請使用搜尋功能",
        });
      }
    } catch (error) {
      console.error('Convert URL error:', error);
      toast({
        variant: "destructive",
        title: "轉換錯誤",
        description: "連結格式轉換失敗",
      });
    }
  };

  // 測試連結
  const testUrl = () => {
    if (!currentUrl) {
      toast({
        variant: "destructive",
        title: "測試失敗",
        description: "請先設定 Google 評論連結",
      });
      return;
    }

    window.open(currentUrl, '_blank');
    toast({
      title: "測試連結",
      description: "已在新分頁開啟 Google 評論頁面",
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          搜尋商家
        </Button>
        
        {currentUrl && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={convertExistingUrl}
              className="flex items-center gap-2"
            >
              轉換格式
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={testUrl}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              測試連結
            </Button>
          </>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              搜尋 Google 商家
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder="輸入商家名稱或地址..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pr-10"
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => {
                    setSearchQuery("");
                    clearSuggestions();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {isSearching && (
              <div className="text-center py-4 text-muted-foreground">
                搜尋中...
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="max-h-60 overflow-y-auto space-y-1">
                {suggestions.map((place) => (
                  <Button
                    key={place.placeId}
                    type="button"
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto text-left"
                    onClick={() => getPlaceDetails(place)}
                    disabled={isGettingDetails && selectedPlace?.placeId === place.placeId}
                  >
                    <div className="flex items-start gap-2 w-full">
                      <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {place.structuredFormatting?.main_text || place.description}
                        </div>
                        {place.structuredFormatting?.secondary_text && (
                          <div className="text-sm text-muted-foreground truncate">
                            {place.structuredFormatting.secondary_text}
                          </div>
                        )}
                        {isGettingDetails && selectedPlace?.placeId === place.placeId && (
                          <div className="text-xs text-primary mt-1">
                            取得評論連結中...
                          </div>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && suggestions.length === 0 && !isSearching && (
              <div className="text-center py-4 text-muted-foreground">
                找不到相關商家，請嘗試不同的關鍵字
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};