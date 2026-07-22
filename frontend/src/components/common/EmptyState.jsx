import React from 'react';
import { Button } from '@/components/ui/button';

export default function EmptyState({ icon: Icon, title, description, actionText, onAction, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/60 rounded-2xl bg-muted/20 ${className}`}>
      {Icon && (
        <div className="p-4 bg-muted/60 rounded-full text-muted-foreground mb-4">
          <Icon className="h-8 w-8" />
        </div>
      )}
      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="outline" size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
}
