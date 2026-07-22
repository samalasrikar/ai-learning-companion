import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StatsCard({ title, value, description, icon: Icon, trend, className = '' }) {
  return (
    <Card className={`bg-card border-border/40 shadow-sm relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md p-4 rounded-xl ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 p-0">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent className="p-0 mt-1">
        <div className="text-2xl font-black tracking-tight text-foreground">{value}</div>
        {(description || trend) && (
          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
            {trend && (
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary font-bold rounded-full text-[9px]">
                {trend}
              </span>
            )}
            <span>{description}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
