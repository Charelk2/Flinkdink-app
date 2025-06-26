import { render, screen } from '@testing-library/react';
import LanguageModule from './LanguageModule';

// Basic render test to ensure words are passed into the carousel

describe('LanguageModule', () => {
  it('renders a carousel for the given words', () => {
    const words = ['hello', 'world'];
    render(<LanguageModule words={words} />);
    const dots = screen.getAllByTestId('carousel-dot');
    expect(dots).toHaveLength(words.length);
    // One of the words should appear in the DOM
    expect(screen.getByText(/hello|world/)).toBeInTheDocument();
  });
});
