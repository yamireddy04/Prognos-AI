import { render } from '@testing-library/react';
import { HighlightedNote } from './HighlightedNote';
import { TokenSpan } from '../utils/api';

describe('HighlightedNote', () => {
  it('renders the correct number of highlighted and plain tokens', () => {
    const spans: TokenSpan[] = [
      { token: 'fever', score: 0.9, highlighted: true },
      { token: 'and', score: 0, highlighted: false },
      { token: 'pain', score: 0.5, highlighted: true },
      { token: 'noted', score: 0, highlighted: false },
    ];

    const { container } = render(<HighlightedNote spans={spans} />);

    const highlightedTokens = container.querySelectorAll('.highlight-word');
    expect(highlightedTokens).toHaveLength(2);

    const allSpans = container.querySelectorAll('span');
    const plainTokens = Array.from(allSpans).filter(el => !el.classList.contains('highlight-word'));
    expect(plainTokens).toHaveLength(2);

    expect(highlightedTokens[0]).toHaveTextContent('fever');
    expect(highlightedTokens[1]).toHaveTextContent('pain');
  });

  it('applies the high-importance class only above the 0.7 score threshold', () => {
    const spans: TokenSpan[] = [
      { token: 'critical', score: 0.85, highlighted: true },
      { token: 'moderate', score: 0.5, highlighted: true },
      { token: 'mild', score: 0.2, highlighted: true },
    ];

    const { container } = render(<HighlightedNote spans={spans} />);

    expect(container.querySelectorAll('.highlight-high')).toHaveLength(1);
    expect(container.querySelectorAll('.highlight-medium')).toHaveLength(1);
    expect(container.querySelectorAll('.highlight-low')).toHaveLength(1);
  });
});