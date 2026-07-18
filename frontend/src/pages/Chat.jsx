import React, { useState } from 'react';

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: 'Hello! I am your AI Learning Companion. What would you like to study or discuss today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text: input }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100svh-120px)] max-w-4xl mx-auto p-4 w-full text-left">
      <div className="flex-1 overflow-y-auto space-y-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/20">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 text-left shadow-sm ${
                msg.role === 'user'
                  ? 'bg-violet-600 text-white'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-zinc-50'
              }`}
            >
              <p className="text-xs font-semibold opacity-70 mb-1">
                {msg.role === 'user' ? 'You' : 'AI Companion'}
              </p>
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question or request a summary..."
          className="flex-1 px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent text-sm text-zinc-900 dark:text-zinc-50"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors text-sm shadow-sm"
        >
          Send
        </button>
      </form>
    </div>
  );
}
