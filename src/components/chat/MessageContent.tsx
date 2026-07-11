"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/lib/utils";

interface MessageContentProps {
  content: string;
  isStreaming?: boolean;
}

export default function MessageContent({
  content,
  isStreaming,
}: MessageContentProps) {
  return (
    <div className={cn("message-content text-sm leading-relaxed")}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Override pre/code for our glass styling
          pre: ({ children, ...props }) => (
            <pre
              className="bg-black/40 border border-white/[0.08] rounded-lg p-4 overflow-x-auto my-3"
              {...props}
            >
              {children}
            </pre>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="bg-white/[0.06] border border-white/[0.08] rounded px-1.5 py-0.5 text-[0.875em] font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={cn("text-sm font-mono", className)} {...props}>
                {children}
              </code>
            );
          },
          // Style tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-3">
              <table className="w-full border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-white/[0.08] px-3 py-2">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 ml-0.5 bg-[var(--accent)] animate-pulse rounded-sm align-middle" />
      )}
    </div>
  );
}
