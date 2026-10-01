import type { ReactNode } from 'react';

// Render the supported Markdown as React nodes. User supplied HTML is always text.
function inline(source: string): ReactNode[] {
  const pattern = /(!?\[([^\]]+)\]\(([^\s)]+)\)|`[^`\n]+`|\*\*[^*\n]+\*\*|__[^_\n]+__|~~[^~\n]+~~|\*[^*\n]+\*|_[^_\n]+_)/g;
  const nodes: ReactNode[] = [];
  let start = 0;
  for (const match of source.matchAll(pattern)) {
    const index = match.index;
    if (index > start) nodes.push(source.slice(start, index));
    const token = match[0];
    const key = index;
    if (match[2] && match[3]) {
      const url = match[3];
      const isImage = token.startsWith('!');
      const safe = isImage ? /^https?:\/\//i.test(url) : /^(https?:\/\/|mailto:)/i.test(url);
      if (!safe) nodes.push(token);
      else if (isImage) nodes.push(<img key={key} src={url} alt={match[2]} className="my-3 max-w-full rounded-lg" />);
      else nodes.push(<a key={key} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-300 underline underline-offset-2 break-all">{inline(match[2])}</a>);
    } else if (token.startsWith('`')) nodes.push(<code key={key} className="rounded bg-gray-100 dark:bg-gray-800 px-1 py-0.5 text-[0.9em]">{token.slice(1, -1)}</code>);
    else if (token.startsWith('**') || token.startsWith('__')) nodes.push(<strong key={key}>{inline(token.slice(2, -2))}</strong>);
    else if (token.startsWith('~~')) nodes.push(<del key={key}>{inline(token.slice(2, -2))}</del>);
    else nodes.push(<em key={key}>{inline(token.slice(1, -1))}</em>);
    start = index + token.length;
  }
  if (start < source.length) nodes.push(source.slice(start));
  return nodes;
}

function lines(source: string): ReactNode[] {
  const input = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  const isBlock = (line: string) => /^(#{1,6} |\s*[-*+] |\s*\d+\. |\s*>|```|---\s*$)/.test(line);
  while (i < input.length) {
    const line = input[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith('```')) {
      const code: string[] = [];
      i++;
      while (i < input.length && !input[i].startsWith('```')) code.push(input[i++]);
      if (i < input.length) i++;
      blocks.push(<pre key={i} className="my-3 overflow-x-auto rounded-lg bg-gray-100 dark:bg-gray-800 p-3 text-sm"><code>{code.join('\n')}</code></pre>);
      continue;
    }
    const heading = /^(#{1,6}) (.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const className = `mt-4 mb-2 font-bold ${level <= 2 ? 'text-xl' : 'text-lg'}`;
      const content = inline(heading[2]);
      blocks.push(
        level === 1 ? <h1 key={i} className={className}>{content}</h1> :
        level === 2 ? <h2 key={i} className={className}>{content}</h2> :
        level === 3 ? <h3 key={i} className={className}>{content}</h3> :
        level === 4 ? <h4 key={i} className={className}>{content}</h4> :
        level === 5 ? <h5 key={i} className={className}>{content}</h5> :
        <h6 key={i} className={className}>{content}</h6>
      );
      i++;
      continue;
    }
    if (/^---\s*$/.test(line)) { blocks.push(<hr key={i} className="my-4 border-gray-200 dark:border-gray-700" />); i++; continue; }
    if (/^\s*>/.test(line)) {
      const quote: string[] = [];
      while (i < input.length && /^\s*>/.test(input[i])) quote.push(input[i++].replace(/^\s*> ?/, ''));
      blocks.push(<blockquote key={i} className="my-3 border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic">{lines(quote.join('\n'))}</blockquote>);
      continue;
    }
    const list = /^(\s*)([-*+] |\d+\. )/.exec(line);
    if (list) {
      const ordered = /\d/.test(list[2][0]);
      const items: ReactNode[] = [];
      const pattern = ordered ? /^\s*\d+\. (.*)$/ : /^\s*[-*+] (.*)$/;
      while (i < input.length) {
        const item = pattern.exec(input[i]);
        if (!item) break;
        items.push(<li key={i}>{inline(item[1])}</li>);
        i++;
      }
      blocks.push(ordered ? <ol key={i} className="my-2 list-decimal pl-6 space-y-1">{items}</ol> : <ul key={i} className="my-2 list-disc pl-6 space-y-1">{items}</ul>);
      continue;
    }
    const paragraph = [line];
    i++;
    while (i < input.length && input[i].trim() && !isBlock(input[i])) paragraph.push(input[i++]);
    blocks.push(<p key={i} className="my-2">{paragraph.map((part, index) => <span key={index}>{index > 0 && <br />}{inline(part)}</span>)}</p>);
  }
  return blocks;
}

export default function EventMarkdown({ text }: { text: string }) {
  return <div className="[overflow-wrap:anywhere] leading-relaxed">{lines(text)}</div>;
}
