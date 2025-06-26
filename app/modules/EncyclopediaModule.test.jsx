import { render, screen } from '@testing-library/react'
import EncyclopediaModule from './EncyclopediaModule'

jest.mock('../utils/encyclopediaImages', () => ({
  lion: '/assets/encyclopedia/lion.svg',
}))

// Verify the image uses responsive height classes and includes an alt attribute

describe('EncyclopediaModule', () => {
  it('renders images with responsive classes and alt text', () => {
    const cards = [
      {
        image: '/images/test.svg',
        title: 'Test Card',
        fact: 'A fact',
      },
    ];
    render(<EncyclopediaModule cards={cards} />);
    const img = screen.getByRole('img', { name: 'Test Card' });
    expect(img).toHaveAttribute('alt', 'Test Card');
    expect(img).toHaveClass('w-full', 'rounded-xl', 'encyclopedia-thumb');
    const picture = img.closest('picture');
    expect(picture).not.toBeNull();
    expect(picture).toHaveClass('zoom-img');
    const sources = picture.querySelectorAll('source');
    expect(sources).toHaveLength(2);
    expect(sources[0]).toHaveAttribute('type', 'image/avif');
    expect(sources[1]).toHaveAttribute('type', 'image/webp');
  });

  it('uses local images when the slug matches', () => {
    const cards = [
      { id: 'lion', image: '/images/test.svg', title: 'Lion', fact: 'King' },
    ]
    render(<EncyclopediaModule cards={cards} />)
    const img = screen.getByRole('img', { name: 'Lion' })
    expect(img).toHaveAttribute('src', '/assets/encyclopedia/lion.svg')
  })

  it('places the fact text after the progress dots', () => {
    const cards = [
      { image: '/images/dog.svg', title: 'Dog', fact: 'Best friend' },
    ]
    render(<EncyclopediaModule cards={cards} />)
    const progress = screen.getByLabelText('carousel-progress')
    const fact = screen.getByText('Best friend')
    const order = progress.compareDocumentPosition(fact)
    expect(order & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Dog' })).toBeInTheDocument()
  })
});
