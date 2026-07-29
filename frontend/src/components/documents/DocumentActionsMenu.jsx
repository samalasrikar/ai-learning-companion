import React from 'react';
import { Eye, Download, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Action dropdown menu for document items (View Content, Download File, Delete).
 * Closes cleanly on selection and prevents duplicate triggers.
 */
export default function DocumentActionsMenu({
  doc,
  onViewContent,
  onDownload,
  onDelete,
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label={`Actions for ${doc.name || 'document'}`}
          className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-border/40 text-xs w-44">
        <DropdownMenuItem
          onClick={() => onViewContent?.(doc)}
          className="flex items-center gap-2 cursor-pointer text-xs"
        >
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          <span>View Content</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onDownload?.(doc)}
          className="flex items-center gap-2 cursor-pointer text-xs"
        >
          <Download className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Download File</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onDelete?.(doc)}
          className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer text-xs font-medium"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
