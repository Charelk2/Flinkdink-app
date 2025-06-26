import { render, screen } from '@testing-library/react';
import MathModule, { createSlides } from './MathModule';

describe('MathModule', () => {
  it('creates a carousel with a configurable slide count', () => {
    render(<MathModule start={1} length={5} />);
    const dots = screen.getAllByTestId('carousel-dot');
    expect(dots).toHaveLength(5);
  });

  it('appends addition slides when a sum is provided', () => {
    const sum = { a: 1, b: 2, sum: 3 };
    render(<MathModule start={1} length={2} sum={sum} />);
    const dots = screen.getAllByTestId('carousel-dot');
    expect(dots).toHaveLength(5); // 2 number slides + 3 addition slides
    expect(screen.getByText('1 + 2 = 3')).toBeInTheDocument();
  });

  it('supports three-number addition problems', () => {
    const sum = { a: 1, b: 2, c: 3, sum: 6 };
    render(<MathModule start={1} length={2} sum={sum} />);
    const dots = screen.getAllByTestId('carousel-dot');
    expect(dots).toHaveLength(6); // 2 number slides + 4 addition slides
    expect(screen.getByText('1 + 2 + 3 = 6')).toBeInTheDocument();
  });

  it('appends subtraction slides when a difference is provided', () => {
    const diff = { a: 5, b: 2, difference: 3 };
    render(<MathModule start={1} length={2} difference={diff} />);
    const dots = screen.getAllByTestId('carousel-dot');
    expect(dots).toHaveLength(5); // 2 number slides + 3 subtraction slides
    expect(screen.getByText('5 - 2 = 3')).toBeInTheDocument();
  });

  it('supports three-number subtraction problems', () => {
    const diff = { a: 7, b: 3, c: 1, difference: 3 };
    render(<MathModule start={1} length={2} difference={diff} />);
    const dots = screen.getAllByTestId('carousel-dot');
    expect(dots).toHaveLength(6); // 2 number slides + 4 subtraction slides
    expect(screen.getByText('7 - 3 - 1 = 3')).toBeInTheDocument();
  });

  it('appends multiplication slides when a product is provided', () => {
    const prod = { a: 2, b: 3, product: 6 };
    render(<MathModule start={1} length={2} product={prod} />);
    const dots = screen.getAllByTestId('carousel-dot');
    expect(dots).toHaveLength(5); // 2 number slides + 3 multiplication slides
    expect(screen.getByText('2 × 3 = 6')).toBeInTheDocument();
  });

  it('appends division slides when a quotient is provided', () => {
    const quot = { a: 8, b: 2, quotient: 4 };
    render(<MathModule start={1} length={2} quotient={quot} />);
    const dots = screen.getAllByTestId('carousel-dot');
    expect(dots).toHaveLength(5); // 2 number slides + 3 division slides
    expect(screen.getByText('8 ÷ 2 = 4')).toBeInTheDocument();
  });

  it('renders visible dots for each math slide', () => {
    const { container } = render(<MathModule start={1} />);
    const card = container.querySelector('.card');
    expect(card).not.toBeNull();
    const board = card.querySelector('div.relative');
    expect(board).not.toBeNull();
    const dots = board.querySelectorAll('span');
    expect(dots.length).toBeGreaterThan(0);
    dots.forEach((dot) => {
      const computed = getComputedStyle(dot);
      expect(parseFloat(computed.width)).toBeGreaterThan(0);
      expect(parseFloat(computed.height)).toBeGreaterThan(0);
      expect(dot.style.backgroundColor).not.toBe('');
    });
  });

  it('displays the dot count in the corner', () => {
    render(<MathModule start={1} length={3} />);
    const counter = screen.getByTestId('dot-count');
    expect(counter).toHaveTextContent('1');
  });

  it('positions the dot count at the top right', () => {
    render(<MathModule start={1} length={3} />);
    const counter = screen.getByTestId('dot-count');
    const styles = getComputedStyle(counter);
    expect(styles.position).toBe('absolute');
    expect(styles.top).toBe('0px');
    expect(styles.right).toBe('0px');
  });

  it('positions the dot count relative to the slide container', () => {
    const { container } = render(<MathModule start={1} length={3} />);
    const card = container.querySelector('.card');
    const board = card.querySelector('div.relative');
    const counter = screen.getByTestId('dot-count');
    expect(card.contains(counter)).toBe(true);
    expect(board.contains(counter)).toBe(false);
  });

  it('shows counting text for sequential numbers', () => {
    render(<MathModule start={1} length={3} />);
    expect(screen.getByText('Count from 1 to 3')).toBeInTheDocument();
  });

  it("shows counting text for custom step sequences", () => {
    render(<MathModule numbers={[2, 4, 6, 8]} />);
    expect(screen.getByText("Count in 2's from 2 to 8")).toBeInTheDocument();
  });

  describe('createSlides', () => {
    it('returns week one numbers in order', () => {
      expect(createSlides(1, 5, false)).toEqual([1, 2, 3, 4, 5]);
    });

    it('shuffles only the first half for later weeks', () => {
      const slides = createSlides(6, 10, true);
      expect(slides.slice(5)).toEqual([11, 12, 13, 14, 15]);
      const firstHalf = [...slides.slice(0, 5)].sort((a, b) => a - b);
      expect(firstHalf).toEqual([6, 7, 8, 9, 10]);
    });

    it('uses explicit numbers when provided', () => {
      const slides = createSlides(1, 5, false, [2, 4, 6]);
      expect(slides).toEqual([2, 4, 6]);
    });
  });
});
