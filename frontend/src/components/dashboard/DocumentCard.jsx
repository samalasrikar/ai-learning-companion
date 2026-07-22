import React from 'react';
import { FileText, MoreVertical, Trash2, Download, Eye, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function DocumentCard({ doc, onAnalyze, onDelete }) {
  const { name, size, date } = doc;

  return (
    <Card className="bg-card border-border/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 shadow-sm p-3.5 rounded-xl">
      <CardContent className="p-0 flex items-center justify-between gap-3 w-full">
        {/* Document Icon & Details */}
        <div className="flex items-center gap-2.5 min-w-0 text-left">
          <div className="p-2 bg-muted rounded-lg shrink-0 text-primary">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-foreground truncate max-w-[180px]" title={name}>
              {name}
            </h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {size} • {date}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            onClick={() => onAnalyze?.(doc)}
            className="hidden sm:flex items-center gap-1 text-[10px] font-bold h-7 px-2.5 bg-primary/10 hover:bg-primary/20 text-primary border-none shadow-none rounded-lg"
          >
            <Sparkles className="h-3 w-3" />
            <span>Analyze</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-border/40 text-xs">
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-xs">
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                <span>View Content</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-xs">
                <Download className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Download File</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(doc)}
                className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
