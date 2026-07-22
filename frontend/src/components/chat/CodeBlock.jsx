import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

function CodeBlock({ className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || '');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 border border-border/40 rounded-lg overflow-hidden bg-slate-950 text-slate-100 shadow-md w-full">
      {/* Header bar of code block */}
      <div className="flex justify-between items-center px-4 py-1.5 bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 font-sans font-bold select-none">
        <span>{match ? match[1] : 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-slate-200 transition-colors cursor-pointer"
          aria-label="Copy code block"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      
      {/* Code contents */}
      <pre className="p-3.5 overflow-x-auto font-mono text-[13px] text-left leading-relaxed">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}

export default React.memo(CodeBlock);
