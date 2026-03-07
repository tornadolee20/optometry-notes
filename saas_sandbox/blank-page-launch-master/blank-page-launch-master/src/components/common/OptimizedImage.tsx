import { useState, useRef, useEffect } from "react";
import { Loader2, ImageOff } from "lucide-react";
import PerformanceService from "@/services/performanceService";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  blurDataURL?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  fallback?: React.ReactNode;
}

interface ImageState {
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
  isIntersecting: boolean;
}

export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = "",
  placeholder,
  blurDataURL,
  priority = false,
  quality = 75,
  sizes,
  loading = 'lazy',
  onLoad,
  onError,
  fallback
}: OptimizedImageProps) => {
  const [state, setState] = useState<ImageState>({
    isLoading: !priority,
    isLoaded: false,
    hasError: false,
    isIntersecting: false
  });

  const imgRef = useRef<HTMLImageElement>(null);
  const performanceService = PerformanceService.getInstance();

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') {
      setState(prev => ({ ...prev, isIntersecting: true }));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setState(prev => ({ ...prev, isIntersecting: true }));
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image enters viewport
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
      observer.disconnect();
    };
  }, [priority, loading]);

  // Handle image loading
  useEffect(() => {
    if (!state.isIntersecting && !priority) return;

    const startTime = performanceService.startMeasure(`image-load-${src}`);
    
    const img = new Image();
    
    img.onload = () => {
      performanceService.endMeasure(`image-load-${src}`, startTime);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isLoaded: true, 
        hasError: false 
      }));
      onLoad?.();
    };

    img.onerror = () => {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isLoaded: false, 
        hasError: true 
      }));
      onError?.();
    };

    // Set src with optimization parameters
    img.src = optimizeImageSrc(src, { width, height, quality });

  }, [state.isIntersecting, src, width, height, quality, priority, onLoad, onError]);

  // Generate srcSet for responsive images
  const generateSrcSet = (baseSrc: string) => {
    if (!width) return undefined;

    const sizes = [0.5, 1, 1.5, 2]; // Different scale factors
    return sizes
      .map(scale => {
        const scaledWidth = Math.round(width * scale);
        const optimizedSrc = optimizeImageSrc(baseSrc, { 
          width: scaledWidth, 
          height: height ? Math.round(height * scale) : undefined,
          quality 
        });
        return `${optimizedSrc} ${scaledWidth}w`;
      })
      .join(', ');
  };

  // Render loading state
  if (state.isLoading || (!state.isIntersecting && !priority)) {
    return (
      <div 
        ref={imgRef}
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        {blurDataURL ? (
          <img
            src={blurDataURL}
            alt=""
            className="w-full h-full object-cover blur-sm"
            style={{ filter: 'blur(5px)' }}
          />
        ) : placeholder ? (
          <img
            src={placeholder}
            alt=""
            className="w-full h-full object-cover opacity-50"
          />
        ) : (
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        )}
      </div>
    );
  }

  // Render error state
  if (state.hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div 
        className={`bg-gray-100 flex flex-col items-center justify-center text-gray-400 ${className}`}
        style={{ width, height }}
      >
        <ImageOff className="w-8 h-8 mb-2" />
        <span className="text-sm">圖片載入失敗</span>
      </div>
    );
  }

  // Render loaded image
  return (
    <img
      ref={imgRef}
      src={optimizeImageSrc(src, { width, height, quality })}
      srcSet={generateSrcSet(src)}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      className={`transition-opacity duration-300 ${state.isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      loading={loading}
      decoding="async"
    />
  );
};

/**
 * Optimize image source URL with parameters
 */
function optimizeImageSrc(src: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}): string {
  // If it's a relative path or doesn't need optimization, return as-is
  if (src.startsWith('/') || src.startsWith('data:') || src.includes('localhost')) {
    return src;
  }

  // For external URLs, you might want to use a service like Cloudinary, ImageKit, etc.
  // This is a simplified example
  const url = new URL(src);
  const params = new URLSearchParams();

  if (options.width) params.set('w', options.width.toString());
  if (options.height) params.set('h', options.height.toString());
  if (options.quality) params.set('q', options.quality.toString());
  if (options.format) params.set('f', options.format);

  // Add auto format and quality if supported by the service
  params.set('auto', 'format,compress');

  url.search = params.toString();
  return url.toString();
}

/**
 * Progressive Image Component with blur-up effect
 */
export const ProgressiveImage = ({
  src,
  placeholder,
  alt,
  className = "",
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder image */}
      {placeholder && (
        <img
          src={placeholder}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ filter: 'blur(5px) brightness(0.9)' }}
        />
      )}

      {/* Main image */}
      <OptimizedImage
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
        {...props}
      />
    </div>
  );
};

/**
 * Avatar Image Component with fallback
 */
interface AvatarImageProps extends Omit<OptimizedImageProps, 'fallback'> {
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AvatarImage = ({
  src,
  alt,
  name,
  size = 'md',
  className = "",
  ...props
}: AvatarImageProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-lg'
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const fallback = (
    <div className={`
      ${sizeClasses[size]} 
      rounded-full 
      bg-gradient-to-br from-blue-500 to-purple-600 
      flex items-center justify-center 
      text-white font-medium 
      ${className}
    `}>
      {getInitials(name)}
    </div>
  );

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      fallback={fallback}
      {...props}
    />
  );
};

/**
 * Gallery Image Component with zoom capability
 */
interface GalleryImageProps extends OptimizedImageProps {
  zoomable?: boolean;
  caption?: string;
}

export const GalleryImage = ({
  src,
  alt,
  zoomable = false,
  caption,
  className = "",
  ...props
}: GalleryImageProps) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleClick = () => {
    if (zoomable) {
      setIsZoomed(true);
    }
  };

  const handleClose = () => {
    setIsZoomed(false);
  };

  return (
    <>
      <figure className={`group ${className}`}>
        <div 
          className={`
            relative overflow-hidden rounded-lg
            ${zoomable ? 'cursor-zoom-in hover:opacity-90 transition-opacity' : ''}
          `}
          onClick={handleClick}
        >
          <OptimizedImage
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            {...props}
          />
          {zoomable && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
              <div className="bg-white bg-opacity-90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </div>
            </div>
          )}
        </div>
        {caption && (
          <figcaption className="mt-2 text-sm text-gray-600 text-center">
            {caption}
          </figcaption>
        )}
      </figure>

      {/* Zoom Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div className="max-w-full max-h-full">
            <OptimizedImage
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain"
              priority
            />
          </div>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
};

export default OptimizedImage;