import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight } from 'lucide-react';

export default function FeatureCard({ title, description, icon: Icon, to, iconBg = 'bg-primary/10', iconColor = 'text-primary', className = '' }) {
  const navigate = useNavigate();

  return (
    <Card 
      onClick={() => navigate(to)}
      className={`bg-card/85 border-border/40 hover:border-primary/20 hover:shadow-md transition-all duration-200 rounded-xl cursor-pointer group p-4 flex flex-col justify-between h-36 ${className}`}
    >
      <CardContent className="p-0 flex flex-col justify-between h-full w-full">
        <div className="flex justify-between items-start w-full">
          <div className={`p-2 ${iconBg} ${iconColor} rounded-lg shrink-0`}>
            {Icon && <Icon className="h-4.5 w-4.5" />}
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
        </div>
        <div className="text-left mt-2">
          <h3 className="text-sm font-bold text-foreground mb-0.5 leading-tight">{title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
