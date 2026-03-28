"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

function extractFeaturedImage(markdown: string) {
  const match = markdown.match(/^Featured image:\s+(https?:\/\/\S+)\s*\n*/i);

  if (!match) {
    return {
      imageUrl: "",
      content: markdown,
    };
  }

  return {
    imageUrl: match[1],
    content: markdown.slice(match[0].length).trimStart(),
  };
}

export function getMarkdownPreview(markdown: string) {
  const { content } = extractFeaturedImage(markdown);
  const [firstBlock = content] = content.split(/\n\s*\n/);
  return firstBlock.trim();
}

export default function MarkdownContent({
  markdown,
  className,
  compact = false,
}: {
  markdown: string;
  className?: string;
  compact?: boolean;
}) {
  const { imageUrl, content } = extractFeaturedImage(markdown);

  return (
    <div
      className={cn(
        "space-y-4 text-slate-700",
        compact
          ? "[&_blockquote]:border-l-2 [&_blockquote]:border-slate-300 [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_li]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_p]:leading-6 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:bg-slate-950 [&_pre]:p-4 [&_pre]:text-slate-100 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-1"
          : "[&_a]:font-medium [&_a]:text-sky-700 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:rounded-md [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_li]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_p]:leading-8 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:bg-slate-950 [&_pre]:p-4 [&_pre]:text-slate-100 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2",
        className,
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Thread attachment"
          className={cn(
            "w-full rounded-[24px] border border-slate-200 object-cover shadow-sm",
            compact ? "max-h-60" : "max-h-[32rem]",
          )}
        />
      ) : null}

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node: _node, ...props }) => (
            <a {...props} target="_blank" rel="noreferrer" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
