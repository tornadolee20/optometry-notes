import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils/test-utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

describe('Card Components', () => {
  it('renders Card with correct structure', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Test content</p>
        </CardContent>
        <CardFooter>
          <button>Test Footer</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByText('Test Footer')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="header">
          <CardTitle data-testid="title">Title</CardTitle>
          <CardDescription data-testid="description">Description</CardDescription>
        </CardHeader>
        <CardContent data-testid="content">Content</CardContent>
        <CardFooter data-testid="footer">Footer</CardFooter>
      </Card>
    );

    expect(screen.getByTestId('card')).toHaveClass('rounded-lg', 'border', 'bg-card');
    expect(screen.getByTestId('header')).toHaveClass('flex', 'flex-col', 'space-y-1.5');
    expect(screen.getByTestId('title')).toHaveClass('text-2xl', 'font-semibold');
    expect(screen.getByTestId('description')).toHaveClass('text-sm', 'text-muted-foreground');
    expect(screen.getByTestId('content')).toHaveClass('p-6', 'pt-0');
    expect(screen.getByTestId('footer')).toHaveClass('flex', 'items-center', 'p-6');
  });

  it('accepts custom className', () => {
    render(
      <Card className="custom-card" data-testid="card">
        <CardHeader className="custom-header" data-testid="header">
          <CardTitle className="custom-title" data-testid="title">Title</CardTitle>
        </CardHeader>
      </Card>
    );

    expect(screen.getByTestId('card')).toHaveClass('custom-card');
    expect(screen.getByTestId('header')).toHaveClass('custom-header');
    expect(screen.getByTestId('title')).toHaveClass('custom-title');
  });

  it('renders without optional components', () => {
    render(
      <Card data-testid="card">
        <CardContent>Just content</CardContent>
      </Card>
    );

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByText('Just content')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('supports custom HTML attributes', () => {
    render(
      <Card data-testid="card" id="custom-id" aria-label="Custom card">
        <CardContent>Content</CardContent>
      </Card>
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('id', 'custom-id');
    expect(card).toHaveAttribute('aria-label', 'Custom card');
  });
});