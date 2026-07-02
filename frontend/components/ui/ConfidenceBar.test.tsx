import { render, screen } from '@testing-library/react';
import { ConfidenceBar } from './ConfidenceBar';

describe('ConfidenceBar', () => {
  it('renders 0% and a zero-width bar when confidence is 0', () => {
    const { container } = render(<ConfidenceBar confidence={0} />);

    expect(screen.getByText('0%')).toBeInTheDocument();
    const bar = container.querySelector('.h-full') as HTMLElement;
    expect(bar.style.width).toBe('0%');
  });

  it('renders 50% and a half-width bar when confidence is 0.5', () => {
    const { container } = render(<ConfidenceBar confidence={0.5} />);

    expect(screen.getByText('50%')).toBeInTheDocument();
    const bar = container.querySelector('.h-full') as HTMLElement;
    expect(bar.style.width).toBe('50%');
  });

  it('renders 100% and a full-width bar when confidence is 1.0', () => {
    const { container } = render(<ConfidenceBar confidence={1.0} />);

    expect(screen.getByText('100%')).toBeInTheDocument();
    const bar = container.querySelector('.h-full') as HTMLElement;
    expect(bar.style.width).toBe('100%');
  });
});