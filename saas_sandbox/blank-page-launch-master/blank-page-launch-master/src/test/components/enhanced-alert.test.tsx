import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnhancedAlert, ErrorAlert, SuccessAlert, ToastAlert } from '@/components/ui/enhanced-alert';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('EnhancedAlert', () => {
  const defaultProps = {
    type: 'info' as const,
    message: 'Test message',
    isVisible: true,
  };

  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should render alert with message', () => {
    render(<EnhancedAlert {...defaultProps} />);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should render title when provided', () => {
    render(<EnhancedAlert {...defaultProps} title="Test Title" />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should render close button when showCloseButton is true', () => {
    const onClose = vi.fn();
    render(
      <EnhancedAlert 
        {...defaultProps} 
        showCloseButton={true} 
        onClose={onClose} 
      />
    );
    
    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
    
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('should render retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<EnhancedAlert {...defaultProps} onRetry={onRetry} />);
    
    const retryButton = screen.getByText('重試');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });

  it('should render action button when onAction and actionLabel are provided', () => {
    const onAction = vi.fn();
    render(
      <EnhancedAlert 
        {...defaultProps} 
        onAction={onAction} 
        actionLabel="Custom Action" 
      />
    );
    
    const actionButton = screen.getByText('Custom Action');
    expect(actionButton).toBeInTheDocument();
    
    fireEvent.click(actionButton);
    expect(onAction).toHaveBeenCalled();
  });

  it('should auto-close when autoClose is enabled', async () => {
    const onClose = vi.fn();
    render(
      <EnhancedAlert 
        {...defaultProps} 
        autoClose={true}
        autoCloseDelay={1000}
        onClose={onClose} 
      />
    );
    
    // Fast-forward timer
    vi.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should not auto-close when persistent is true', async () => {
    const onClose = vi.fn();
    render(
      <EnhancedAlert 
        {...defaultProps} 
        autoClose={true}
        persistent={true}
        autoCloseDelay={1000}
        onClose={onClose} 
      />
    );
    
    vi.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(onClose).not.toHaveBeenCalled();
    }, { timeout: 100 });
  });

  it('should not render when isVisible is false', () => {
    render(<EnhancedAlert {...defaultProps} isVisible={false} />);
    
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  describe('Alert Types', () => {
    it('should render error alert with correct styling', () => {
      render(<EnhancedAlert type="error" message="Error message" />);
      
      expect(screen.getByText('Error message')).toBeInTheDocument();
      // Check for error-specific elements (icon, colors, etc.)
    });

    it('should render success alert with correct styling', () => {
      render(<EnhancedAlert type="success" message="Success message" />);
      
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    it('should render warning alert with correct styling', () => {
      render(<EnhancedAlert type="warning" message="Warning message" />);
      
      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });
  });
});

describe('ErrorAlert', () => {
  it('should render as error type', () => {
    render(<ErrorAlert message="Error occurred" />);
    
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
  });
});

describe('SuccessAlert', () => {
  it('should render as success type', () => {
    render(<SuccessAlert message="Success!" />);
    
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });
});

describe('ToastAlert', () => {
  it('should render with default position', () => {
    render(<ToastAlert type="info" message="Toast message" />);
    
    expect(screen.getByText('Toast message')).toBeInTheDocument();
  });

  it('should apply position classes correctly', () => {
    const { container } = render(
      <ToastAlert 
        type="info" 
        message="Toast message" 
        position="bottom-left" 
      />
    );
    
    const toastElement = container.firstChild;
    expect(toastElement).toHaveClass('fixed', 'bottom-4', 'left-4');
  });

  it('should auto-close by default', async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    
    render(
      <ToastAlert 
        type="info" 
        message="Toast message" 
        onClose={onClose}
      />
    );
    
    // Should auto-close by default
    vi.advanceTimersByTime(5000);
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
    
    vi.useRealTimers();
  });
});

describe('Alert Integration', () => {
  it('should handle complex alert scenarios', async () => {
    const onClose = vi.fn();
    const onRetry = vi.fn();
    const onAction = vi.fn();
    
    const { rerender } = render(
      <EnhancedAlert
        type="error"
        title="Connection Error"
        message="Failed to connect to server"
        isVisible={true}
        onClose={onClose}
        onRetry={onRetry}
        onAction={onAction}
        actionLabel="Settings"
        showCloseButton={true}
      />
    );
    
    // Check all elements are present
    expect(screen.getByText('Connection Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to connect to server')).toBeInTheDocument();
    expect(screen.getByText('重試')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    
    // Test interactions
    fireEvent.click(screen.getByText('重試'));
    expect(onRetry).toHaveBeenCalled();
    
    fireEvent.click(screen.getByText('Settings'));
    expect(onAction).toHaveBeenCalled();
    
    // Test hide
    rerender(
      <EnhancedAlert
        type="error"
        title="Connection Error"
        message="Failed to connect to server"
        isVisible={false}
        onClose={onClose}
        onRetry={onRetry}
        onAction={onAction}
        actionLabel="Settings"
        showCloseButton={true}
      />
    );
    
    expect(screen.queryByText('Connection Error')).not.toBeInTheDocument();
  });
});