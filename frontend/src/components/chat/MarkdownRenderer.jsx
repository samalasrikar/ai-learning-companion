import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import CodeBlock from './CodeBlock';

// Inline code renderer
const InlineCode = ({ isAssistant, children, ...props }) => (
  <code 
    className={`px-1.5 py-0.5 rounded font-mono text-xs font-bold break-all ${
      isAssistant 
        ? 'bg-muted text-primary' 
        : 'bg-primary-foreground/20 text-primary-foreground'
    }`} 
    {...props}
  >
    {children}
  </code>
);

function MarkdownRenderer({ text, isAssistant }) {
  const components = {
    p: ({ children }) => (
      <p className={`text-sm leading-relaxed mb-2.5 last:mb-0 ${isAssistant ? 'text-foreground/90' : 'text-primary-foreground'}`}>
        {children}
      </p>
    ),
    h1: ({ children }) => (
      <h1 className={`text-base font-black tracking-tight mt-4 mb-2 first:mt-0 ${isAssistant ? 'text-foreground' : 'text-primary-foreground'}`}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className={`text-sm font-extrabold tracking-tight mt-3 mb-1.5 first:mt-0 ${isAssistant ? 'text-foreground' : 'text-primary-foreground'}`}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className={`text-xs font-extrabold tracking-tight mt-2.5 mb-1 first:mt-0 ${isAssistant ? 'text-foreground' : 'text-primary-foreground'}`}>
        {children}
      </h3>
    ),
    ul: ({ children }) => (
      <ul className={`list-disc pl-5 space-y-1 mb-3 text-sm text-left ${isAssistant ? 'text-foreground/90' : 'text-primary-foreground'}`}>
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className={`list-decimal pl-5 space-y-1 mb-3 text-sm text-left ${isAssistant ? 'text-foreground/90' : 'text-primary-foreground'}`}>
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed">
        {children}
      </li>
    ),
    blockquote: ({ children }) => (
      <blockquote className={`border-l-3 pl-3.5 py-1 my-3 text-sm italic rounded-r-lg ${
        isAssistant 
          ? 'border-primary/40 text-muted-foreground bg-muted/20' 
          : 'border-primary-foreground/40 text-primary-foreground bg-primary-foreground/10'
      }`}>
        {children}
      </blockquote>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`hover:underline font-semibold break-all ${isAssistant ? 'text-primary' : 'text-primary-foreground underline'}`}
      >
        {children}
      </a>
    ),
    table: ({ children }) => (
      <div className="w-full overflow-x-auto border border-border/40 rounded-xl my-3.5 shadow-sm">
        <table className="w-full text-sm border-collapse text-left">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className={`border-b border-border/40 font-semibold text-xs uppercase tracking-wider ${isAssistant ? 'bg-muted/60 text-muted-foreground' : 'bg-primary-foreground/10 text-primary-foreground'}`}>
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody className={`divide-y divide-border/40 ${isAssistant ? 'bg-card' : 'bg-primary-foreground/5'}`}>
        {children}
      </tbody>
    ),
    tr: ({ children }) => (
      <tr className="hover:bg-muted/5 transition-colors">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className={`p-2.5 font-bold ${isAssistant ? 'text-foreground' : 'text-primary-foreground'}`}>
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className={`p-2.5 text-xs leading-relaxed break-words ${isAssistant ? 'text-foreground/90' : 'text-primary-foreground'}`}>
        {children}
      </td>
    ),
    code: ({ node, className, children, ...props }) => {
      const isInline = !className || !className.startsWith('language-');

      if (isInline) {
        return (
          <InlineCode isAssistant={isAssistant} {...props}>
            {children}
          </InlineCode>
        );
      }

      return (
        <CodeBlock className={className} {...props}>
          {children}
        </CodeBlock>
      );
    }
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={components}
    >
      {text}
    </ReactMarkdown>
  );
}

export default React.memo(MarkdownRenderer);
