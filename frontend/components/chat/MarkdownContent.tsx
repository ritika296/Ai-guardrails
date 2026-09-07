"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

// Allow <br> (the assistant sometimes uses it for line breaks inside table
// cells) on top of the default safe-HTML allowlist — nothing script-related.
const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), "br"],
};

/**
 * Renders assistant Markdown (headers, bold, tables, line breaks) with
 * styling that matches the command-center design system, instead of
 * dumping raw markdown syntax as plain text.
 */
export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose-chat text-sm leading-relaxed text-ink">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
