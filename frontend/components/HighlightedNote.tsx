// HighlightedNote.tsx
import { TokenSpan } from '../utils/api';

interface Props {
  spans: TokenSpan[];
}

export function HighlightedNote({ spans }: Props) {
  return (
    <p style={{ fontSize: 12.5, lineHeight: 1.9, color: '#4b5563', fontFamily: 'JetBrains Mono, monospace' }}>
      {spans.map((span, i) => {
        if (!span.highlighted) {
          return <span key={i}>{span.token} </span>;
        }
        const cls =
          span.score > 0.7 ? 'highlight-high' :
          span.score > 0.4 ? 'highlight-medium' : 'highlight-low';
        return (
          <span
            key={i}
            className={`highlight-word ${cls}`}
            title={`Importance: ${(span.score * 100).toFixed(0)}%`}
          >
            {span.token}
          </span>
        );
      }).reduce<React.ReactNode[]>((acc, el, i) => {
        if (i > 0) acc.push(' ');
        acc.push(el);
        return acc;
      }, [])}
    </p>
  );
}