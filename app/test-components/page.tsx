'use client';

import { Button } from '@/components/ui/button';
import { Copy, Edit, Share, Trash2, User } from 'lucide-react';

export default function TestComponentsPage() {
  return (
    <div className="min-h-screen bg-background p-8 space-y-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8 text-center">
          UI Component Test Suite - Gradient Preservation
        </h1>

        {/* Gradient Button Variants Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Gradient Button Variants
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-muted-foreground">Main Gradient</h3>
              <Button 
                variant="gradient" 
                size="gradientDefault"
                data-testid="button-gradient"
              >
                <User className="w-4 h-4" />
                Gradient
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-muted-foreground">Edit Action</h3>
              <Button 
                variant="edit" 
                size="gradientDefault"
                data-testid="button-edit"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-muted-foreground">Delete Action</h3>
              <Button 
                variant="delete" 
                size="gradientDefault"
                data-testid="button-delete"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-muted-foreground">Copy Action</h3>
              <Button 
                variant="copy" 
                size="gradientDefault"
                data-testid="button-copy"
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-muted-foreground">Share Action</h3>
              <Button 
                variant="share" 
                size="gradientDefault"
                data-testid="button-share"
              >
                <Share className="w-4 h-4" />
                Share
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-muted-foreground">User Logged</h3>
              <Button 
                variant="user" 
                size="gradientDefault"
                data-testid="button-user"
              >
                <User className="w-4 h-4" />
                User
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-muted-foreground">Auth Panel</h3>
              <Button 
                variant="authPanel" 
                size="gradientDefault"
                data-testid="button-authPanel"
              >
                Auth
              </Button>
            </div>
          </div>
        </section>

        {/* Size Variants Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Size Variants
          </h2>
          
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Small</p>
              <Button 
                variant="edit" 
                size="gradientSm"
                data-testid="button-edit-sm"
              >
                Small Edit
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Default</p>
              <Button 
                variant="copy" 
                size="gradientDefault"
                data-testid="button-copy-default"
              >
                Default Copy
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Large</p>
              <Button 
                variant="delete" 
                size="gradientLg"
                data-testid="button-delete-lg"
              >
                Large Delete
              </Button>
            </div>
          </div>
        </section>

        {/* States Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Button States
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Normal</p>
              <Button 
                variant="share" 
                size="gradientDefault"
                data-testid="button-share-normal"
              >
                Normal
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Disabled</p>
              <Button 
                variant="share" 
                size="gradientDefault"
                disabled
                data-testid="button-share-disabled"
              >
                Disabled
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">With Custom Class</p>
              <Button 
                variant="edit" 
                size="gradientDefault"
                className="animate-pulse"
                data-testid="button-edit-custom"
              >
                Custom
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">As Child (Link)</p>
              <Button 
                variant="copy" 
                size="gradientDefault"
                asChild
                data-testid="button-copy-link"
              >
                <a href="#test">Link Button</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Standard Shadcn/ui Variants Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Standard Shadcn/ui Variants (Preserved)
          </h2>
          
          <div className="flex flex-wrap gap-4">
            <Button variant="default" data-testid="button-standard-default">
              Default
            </Button>
            <Button variant="destructive" data-testid="button-standard-destructive">
              Destructive
            </Button>
            <Button variant="outline" data-testid="button-standard-outline">
              Outline
            </Button>
            <Button variant="secondary" data-testid="button-standard-secondary">
              Secondary
            </Button>
            <Button variant="ghost" data-testid="button-standard-ghost">
              Ghost
            </Button>
            <Button variant="link" data-testid="button-standard-link">
              Link
            </Button>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Interactive Demo
          </h2>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Hover over the buttons below to test gradient animations and interactions:
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button 
                variant="gradient" 
                size="gradientDefault"
                onClick={() => alert('Gradient button clicked!')}
                data-testid="button-interactive-gradient"
              >
                Click Me - Gradient
              </Button>
              
              <Button 
                variant="edit" 
                size="gradientDefault"
                onClick={() => alert('Edit button clicked!')}
                data-testid="button-interactive-edit"
              >
                <Edit className="w-4 h-4" />
                Edit Item
              </Button>
              
              <Button 
                variant="delete" 
                size="gradientDefault"
                onClick={() => confirm('Are you sure you want to delete?')}
                data-testid="button-interactive-delete"
              >
                <Trash2 className="w-4 h-4" />
                Delete Item
              </Button>
            </div>
          </div>
        </section>

        {/* Dark Mode Test Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Dark Mode Test
          </h2>
          
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <p className="text-muted-foreground">
              These buttons should adapt properly to dark mode with preserved gradients:
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="user" data-testid="button-dark-user">
                <User className="w-4 h-4" />
                User (Dark)
              </Button>
              
              <Button variant="authPanel" data-testid="button-dark-auth">
                Auth Panel (Dark)
              </Button>
              
              <Button variant="gradient" data-testid="button-dark-gradient">
                Main Gradient (Dark)
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground pt-8 border-t border-border">
          <p>
            UI Component Test Suite - All gradient classes preserved ✅
          </p>
          <p className="mt-2">
            Shadcn/ui compatibility maintained with custom gradient variants
          </p>
        </footer>
      </div>
    </div>
  );
}