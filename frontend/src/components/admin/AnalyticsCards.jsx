import React from 'react';
import { MessageSquare, MessagesSquare, Calculator, Award } from 'lucide-react';

export default function AnalyticsCards({ analytics }) {
  const cards = [
    {
      title: 'Total AI Conversations',
      value: analytics?.totalConversations ?? 0,
      description: 'Conversations started by students',
      icon: MessageSquare,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/50',
    },
    {
      title: 'Total Messages',
      value: analytics?.totalMessages ?? 0,
      description: 'Prompts & responses exchanged',
      icon: MessagesSquare,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    },
    {
      title: 'Avg Messages per Chat',
      value: analytics?.avgMessagesPerConversation ?? 0,
      description: 'Engagement density per session',
      icon: Calculator,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/50',
    },
    {
      title: 'Most Active Student',
      value: analytics?.mostActiveStudent?.name || 'N/A',
      description: analytics?.mostActiveStudent
        ? `${analytics.mostActiveStudent.totalMessages} Messages exchanged`
        : 'No activity recorded yet',
      icon: Award,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/50',
      isTextValue: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className={`font-extrabold text-slate-900 dark:text-slate-100 ${card.isTextValue ? 'text-lg truncate' : 'text-3xl'}`}>
                {card.value}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">{card.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
