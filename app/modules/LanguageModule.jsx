import Carousel from '../components/Carousel'

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

const LanguageModule = ({ words }) => {
  const items = shuffle(words)

  return (
    <Carousel
      items={items}
      renderItem={(word) => (
        <div
          className="language-word font-bold lowercase leading-none"
        >
          {word}
        </div>
      )}
    />
  )
}

export default LanguageModule
