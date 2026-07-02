import { render, screen, fireEvent } from '@testing-library/react';
import { ModelSelector } from './ModelSelector';

describe('ModelSelector', () => {
  it('calls onChange with the selected model type when a different option is clicked', () => {
    const handleChange = jest.fn();
    render(<ModelSelector value="baseline" onChange={handleChange} />);

    fireEvent.click(screen.getByText('Groq LLM'));

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('groq');
  });

  it('calls onChange with hybrid when the Hybrid option is clicked', () => {
    const handleChange = jest.fn();
    render(<ModelSelector value="baseline" onChange={handleChange} />);

    fireEvent.click(screen.getByText('Hybrid'));

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('hybrid');
  });

  it('still calls onChange when the currently selected option is clicked again', () => {
    const handleChange = jest.fn();
    render(<ModelSelector value="baseline" onChange={handleChange} />);

    fireEvent.click(screen.getByText('TF-IDF'));

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('baseline');
  });
});