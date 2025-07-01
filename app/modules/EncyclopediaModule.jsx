import { useEffect, useState } from 'react'
import Carousel from '../src/components/Carousel.tsx'
import { imageMap } from '../utils/imageMap'

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

const EncyclopediaModule = ({ cards }) => {
  const [items, setItems] = useState(() =>
    shuffle(
      cards.map((c) => ({
        ...c,
        image: imageMap[c.image] || c.image,
      })),
    ),
  )
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setItems(
      shuffle(
        cards.map((c) => ({
          ...c,
          image: imageMap[c.image] || c.image,
        })),
      ),
    )
  }, [cards])

  return (
    <div className="space-y-4 text-center">
      <Carousel
        items={items}
        onIndexChange={setIndex}
        renderItem={(card) => {
          const img = imageMap[card.image] || card.image

          return (
            <div className="space-y-2">
              <img
                loading="lazy"
                src={img}
                alt={card.title}
                className="w-full rounded-xl encyclopedia-thumb"
              />
              <h3 className="text-xl font-bold">{card.title}</h3>
            </div>
          )
        }}
      />
      <p className="text-white">{items[index]?.fact}</p>
    </div>
  )
}

export default EncyclopediaModule
