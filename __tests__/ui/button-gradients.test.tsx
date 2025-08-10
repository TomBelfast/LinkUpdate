import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import '@testing-library/jest-dom';

describe('Button Component - Gradient Preservation', () => {
  describe('Gradient Variant Classes', () => {
    test('should preserve main gradient button class', () => {
      render(<Button variant="gradient">Main Gradient</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('gradient-button');
    });

    test('should preserve edit gradient variant', () => {
      render(<Button variant="edit">Edit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('gradient-button', 'edit-gradient');
    });

    test('should preserve delete gradient variant', () => {
      render(<Button variant="delete">Delete</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('gradient-button', 'delete-gradient');
    });

    test('should preserve copy gradient variant', () => {
      render(<Button variant="copy">Copy</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('gradient-button', 'copy-gradient');
    });

    test('should preserve share gradient variant', () => {
      render(<Button variant="share">Share</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('gradient-button', 'share-gradient');
    });

    test('should preserve user logged gradient variant', () => {
      render(<Button variant="user">User</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('user-logged-gradient');
    });

    test('should preserve auth panel gradient variant', () => {
      render(<Button variant="authPanel">Auth Panel</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('auth-panel-gradient');
    });
  });

  describe('Gradient Size Variants', () => {
    test('should apply gradient default size', () => {
      render(<Button variant="edit" size="gradientDefault">Edit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-3');
    });

    test('should apply gradient small size', () => {
      render(<Button variant="copy" size="gradientSm">Copy</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2');
    });

    test('should apply gradient large size', () => {
      render(<Button variant="share" size="gradientLg">Share</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-8', 'py-4');
    });
  });

  describe('Standard Shadcn/ui Variants', () => {
    test('should maintain standard default variant', () => {
      render(<Button variant="default">Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    test('should maintain standard destructive variant', () => {
      render(<Button variant="destructive">Destructive</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground');
    });

    test('should maintain standard outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border', 'border-input', 'bg-background');
    });

    test('should maintain standard secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');
    });

    test('should maintain standard ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-accent');
    });

    test('should maintain standard link variant', () => {
      render(<Button variant="link">Link</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-primary', 'underline-offset-4');
    });
  });

  describe('Combined Class Application', () => {
    test('should combine gradient variant with custom className', () => {
      render(
        <Button variant="edit" className="custom-class">
          Edit with Custom
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('gradient-button', 'edit-gradient', 'custom-class');
    });

    test('should combine gradient size with variant', () => {
      render(
        <Button variant="delete" size="gradientLg">
          Large Delete
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'gradient-button', 
        'delete-gradient',
        'px-8', 
        'py-4'
      );
    });
  });

  describe('Accessibility and Functionality', () => {
    test('should be clickable and maintain gradient classes', () => {
      const handleClick = vi.fn();
      render(
        <Button variant="share" onClick={handleClick}>
          Share Button
        </Button>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(button).toHaveClass('gradient-button', 'share-gradient');
    });

    test('should be disabled and maintain gradient classes', () => {
      render(
        <Button variant="copy" disabled>
          Disabled Copy
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('gradient-button', 'copy-gradient');
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
    });

    test('should support asChild prop with gradient variants', () => {
      render(
        <Button variant="edit" asChild>
          <a href="/edit">Edit Link</a>
        </Button>
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('gradient-button', 'edit-gradient');
      expect(link).toHaveAttribute('href', '/edit');
    });
  });

  describe('Focus and Ring States', () => {
    test('should maintain focus ring with gradient variants', () => {
      render(<Button variant="gradient">Focus Test</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass(
        'focus-visible:outline-none',
        'focus-visible:ring-1',
        'focus-visible:ring-ring'
      );
      expect(button).toHaveClass('gradient-button');
    });
  });

  describe('TypeScript Type Safety', () => {
    test('should accept all gradient variant types', () => {
      // This test ensures TypeScript compilation works
      const gradientVariants = [
        'gradient',
        'edit',
        'delete',
        'copy',
        'share', 
        'user',
        'authPanel'
      ] as const;

      gradientVariants.forEach((variant, index) => {
        render(
          <Button key={index} variant={variant}>
            {variant} Button
          </Button>
        );
      });

      // Should render all 7 gradient variants
      expect(screen.getAllByRole('button')).toHaveLength(7);
    });

    test('should accept all gradient size types', () => {
      const gradientSizes = [
        'gradientDefault',
        'gradientSm', 
        'gradientLg'
      ] as const;

      gradientSizes.forEach((size, index) => {
        render(
          <Button key={index} variant="gradient" size={size}>
            Size {size}
          </Button>
        );
      });

      expect(screen.getAllByRole('button')).toHaveLength(3);
    });
  });

  describe('Performance and Re-rendering', () => {
    test('should not break with rapid variant changes', () => {
      const { rerender } = render(<Button variant="edit">Edit</Button>);
      
      // Rapidly change variants
      rerender(<Button variant="delete">Delete</Button>);
      rerender(<Button variant="copy">Copy</Button>);
      rerender(<Button variant="share">Share</Button>);
      rerender(<Button variant="gradient">Gradient</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('gradient-button');
      expect(button).toHaveTextContent('Gradient');
    });

    test('should handle undefined variant gracefully', () => {
      render(<Button>Default Fallback</Button>);
      const button = screen.getByRole('button');
      
      // Should use default variant
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
      expect(button).not.toHaveClass('gradient-button');
    });
  });
});