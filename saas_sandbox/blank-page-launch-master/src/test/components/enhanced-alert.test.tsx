import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EnhancedAlert, ErrorAlert, SuccessAlert, ToastAlert } from '@/components/ui/enhanced-alert';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...domProps } = props;
      return <div {...domProps}>{children}</div>;
    },
    button: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...domProps } = props;
      return <button {...domProps}>{children}</button>;
    },
    h4: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, ...domProps } = props;
      return <h4 {...domProps}>{children}</h4>;
    },
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

  it('should auto-close when autoClose is enabled', () => {
    const onClose = vi.fn();
    render(
      <EnhancedAlert 
        {...defaultProps} 
        autoClose={true}
        autoCloseDelay={1000}
        onClose={onClose} 
      />
    );
    
    expect(onClose).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(onClose).toHaveBeenCalled();
  });

  it('should not auto-close when persistent is true', () => {
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
    
    vi.advanceTimersByTime(2000);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should not render when isVisible is false', () => {
    render(<EnhancedAlert {...defaultProps} isVisible={false} />);
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  describe('Semantic status classes', () => {
    it('should apply semantic error classes', () => {
      const { container } = render(
        <EnhancedAlert type="error" message="Error" isVisible={true} />
      );
      const wrapper = container.querySelector('[data-status="error"]');
      expect(wrapper).toBeInTheDocument();
      const alert = wrapper?.querySelector('[role="alert"]');
      expect(alert?.className).toContain('bg-status-error-bg');
      expect(alert?.className).toContain('border-status-error-border');
    });

    it('should apply semantic success classes', () => {
      const { container } = render(
        <EnhancedAlert type="success" message="OK" isVisible={true} />
      );
      const alert = container.querySelector('[role="alert"]');
      expect(alert?.className).toContain('bg-status-success-bg');
      expect(alert?.className).toContain('border-status-success-border');
    });

    it('should apply semantic warning classes', () => {
      const { container } = render(
        <EnhancedAlert type="warning" message="Warn" isVisible={true} />
      );
      const alert = container.querySelector('[role="alert"]');
      expect(alert?.className).toContain('bg-status-warning-bg');
    });

    it('should apply semantic info classes', () => {
      const { container } = render(
        <EnhancedAlert type="info" message="Info" isVisible={true} />
      );
      const alert = container.querySelector('[role="alert"]');
      expect(alert?.className).toContain('bg-status-info-bg');
    });

    it('should set data-status attribute for each type', () => {
      const types: Array<'error' | 'success' | 'warning' | 'info'> = [
        'error', 'success', 'warning', 'info',
      ];
      types.forEach((type) => {
        const { container, unmount } = render(
          <EnhancedAlert type={type} message={type} isVisible={true} />
        );
        expect(container.querySelector(`[data-status="${type}"]`)).toBeInTheDocument();
        unmount();
      });
    });
  });
});

describe('ErrorAlert', () => {
  it('should render as error type with semantic classes', () => {
    const { container } = render(<ErrorAlert message="Error occurred" />);
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
    expect(container.querySelector('[data-status="error"]')).toBeInTheDocument();
  });
});

describe('SuccessAlert', () => {
  it('should render as success type with semantic classes', () => {
    const { container } = render(<SuccessAlert message="Success!" />);
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(container.querySelector('[data-status="success"]')).toBeInTheDocument();
  });
});

describe('ToastAlert', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

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

  it('should auto-close by default', () => {
    const onClose = vi.fn();
    
    render(
      <ToastAlert 
        type="info" 
        message="Toast message" 
        onClose={onClose}
      />
    );
    
    expect(onClose).not.toHaveBeenCalled();
    vi.advanceTimersByTime(5000);
    expect(onClose).toHaveBeenCalled();
  });
});

describe('Alert Integration', () => {
  it('should handle complex alert scenarios', () => {
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
    
    expect(screen.getByText('Connection Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to connect to server')).toBeInTheDocument();
    expect(screen.getByText('重試')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('重試'));
    expect(onRetry).toHaveBeenCalled();
    
    fireEvent.click(screen.getByText('Settings'));
    expect(onAction).toHaveBeenCalled();
    
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
