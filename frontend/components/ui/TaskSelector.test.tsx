import { render, screen, fireEvent } from '@testing-library/react';
import { TaskSelector } from './TaskSelector';

describe('TaskSelector', () => {
  it('calls onChange with the selected task when a different option is clicked', () => {
    const handleChange = jest.fn();
    render(<TaskSelector value="readmission" onChange={handleChange} />);

    fireEvent.click(screen.getByText('Length of Stay'));

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('los_band');
  });

  it('calls onChange with specialty when the Specialty option is clicked', () => {
    const handleChange = jest.fn();
    render(<TaskSelector value="readmission" onChange={handleChange} />);

    fireEvent.click(screen.getByText('Specialty'));

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('specialty');
  });

  it('still calls onChange when the currently selected option is clicked again', () => {
    const handleChange = jest.fn();
    render(<TaskSelector value="readmission" onChange={handleChange} />);

    fireEvent.click(screen.getByText('Readmission'));

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('readmission');
  });
});