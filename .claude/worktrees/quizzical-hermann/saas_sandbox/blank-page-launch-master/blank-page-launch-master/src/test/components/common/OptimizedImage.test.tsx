import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/test-utils';
import { OptimizedImage, AvatarImage, ProgressiveImage } from '@/components/common/OptimizedImage';

// Mock PerformanceService
vi.mock('@/services/performanceService', () => ({
  default: {
    getInstance: () => ({
      startMeasure: vi.fn(() => Date.now()),
      endMeasure: vi.fn()
    })
  }
}));

describe('OptimizedImage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<OptimizedImage src="test.jpg" alt="Test image" />);
    expect(screen.getByText('載入中...')).toBeInTheDocument();
  });

  it('shows blur placeholder when provided', () => {
    render(
      <OptimizedImage 
        src="test.jpg" 
        alt="Test image" 
        blurDataURL="data:image/jpeg;base64,blur"
      />
    );
    
    const blurImage = screen.getByAltText('');
    expect(blurImage).toHaveAttribute('src', 'data:image/jpeg;base64,blur');
    expect(blurImage).toHaveStyle({ filter: 'blur(5px)' });
  });

  it('displays error state when image fails to load', async () => {
    // Mock failed image load
    const originalImage = global.Image;
    global.Image = class extends originalImage {
      constructor() {
        super();
        setTimeout(() => {
          if (this.onerror) {
            this.onerror(new Event('error'));
          }
        }, 100);
      }
    } as any;

    render(<OptimizedImage src="invalid.jpg" alt="Test image" />);
    
    await waitFor(() => {
      expect(screen.getByText('圖片載入失敗')).toBeInTheDocument();
    });

    // Restore original Image
    global.Image = originalImage;
  });

  it('renders loaded image with correct attributes', async () => {
    render(
      <OptimizedImage 
        src="test.jpg" 
        alt="Test image"
        width={300}
        height={200}
        className="custom-class"
      />
    );

    await waitFor(() => {
      const image = screen.getByAltText('Test image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('width', '300');
      expect(image).toHaveAttribute('height', '200');
      expect(image).toHaveClass('custom-class');
    });
  });

  it('supports priority loading', () => {
    render(<OptimizedImage src="test.jpg" alt="Test image" priority />);
    
    // Priority images should not show loading state
    expect(screen.queryByText('載入中...')).not.toBeInTheDocument();
  });

  it('supports eager loading', () => {
    render(<OptimizedImage src="test.jpg" alt="Test image" loading="eager" />);
    
    // Eager loading should not show loading state
    expect(screen.queryByText('載入中...')).not.toBeInTheDocument();
  });

  it('calls onLoad callback when image loads', async () => {
    const onLoad = vi.fn();
    render(<OptimizedImage src="test.jpg" alt="Test image" onLoad={onLoad} />);

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalled();
    });
  });

  it('shows custom fallback when provided', async () => {
    const fallback = <div>Custom fallback</div>;
    
    // Mock failed image load
    const originalImage = global.Image;
    global.Image = class extends originalImage {
      constructor() {
        super();
        setTimeout(() => {
          if (this.onerror) {
            this.onerror(new Event('error'));
          }
        }, 100);
      }
    } as any;

    render(
      <OptimizedImage 
        src="invalid.jpg" 
        alt="Test image" 
        fallback={fallback}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Custom fallback')).toBeInTheDocument();
    });

    // Restore original Image
    global.Image = originalImage;
  });
});

describe('AvatarImage Component', () => {
  it('renders avatar with correct size classes', () => {
    render(<AvatarImage src="avatar.jpg" alt="User avatar" size="lg" />);
    
    const container = screen.getByAltText('User avatar').parentElement;
    expect(container).toHaveClass('w-16', 'h-16');
  });

  it('shows initials fallback when name is provided', async () => {
    // Mock failed image load
    const originalImage = global.Image;
    global.Image = class extends originalImage {
      constructor() {
        super();
        setTimeout(() => {
          if (this.onerror) {
            this.onerror(new Event('error'));
          }
        }, 100);
      }
    } as any;

    render(
      <AvatarImage 
        src="invalid.jpg" 
        alt="User avatar" 
        name="John Doe"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    // Restore original Image
    global.Image = originalImage;
  });

  it('shows question mark fallback when no name provided', async () => {
    // Mock failed image load
    const originalImage = global.Image;
    global.Image = class extends originalImage {
      constructor() {
        super();
        setTimeout(() => {
          if (this.onerror) {
            this.onerror(new Event('error'));
          }
        }, 100);
      }
    } as any;

    render(<AvatarImage src="invalid.jpg" alt="User avatar" />);

    await waitFor(() => {
      expect(screen.getByText('?')).toBeInTheDocument();
    });

    // Restore original Image
    global.Image = originalImage;
  });
});

describe('ProgressiveImage Component', () => {
  it('renders both placeholder and main image', () => {
    render(
      <ProgressiveImage 
        src="main.jpg"
        placeholder="placeholder.jpg" 
        alt="Progressive image"
      />
    );

    // Should render placeholder
    const placeholder = screen.getByAltText('');
    expect(placeholder).toHaveAttribute('src', 'placeholder.jpg');

    // Should also render main image (but may be hidden)
    expect(screen.getByAltText('Progressive image')).toBeInTheDocument();
  });

  it('applies blur effect to placeholder', () => {
    render(
      <ProgressiveImage 
        src="main.jpg"
        placeholder="placeholder.jpg" 
        alt="Progressive image"
      />
    );

    const placeholder = screen.getByAltText('');
    expect(placeholder).toHaveStyle({ filter: 'blur(5px) brightness(0.9)' });
  });
});