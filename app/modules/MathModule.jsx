import Carousel from '../components/Carousel'
import { generateDotPositions } from '../utils/randomDots'

const DotBoard = ({ count }) => {
  const positions = generateDotPositions(count)
  return (
    <div className="relative w-full math-board">
      <span
        data-testid="dot-count"
        className="absolute top-0 right-0 m-1 text-[10px] text-black"
      >
        {count}
      </span>
      {positions.map((pos, i) => (
        <span
          key={i}
          className="absolute inline-block rounded-full"
          style={{
            width: '1rem',
            height: '1rem',
            top: pos.top,
            left: pos.left,
            backgroundColor: '#ef4444',
          }}
        />
      ))}
    </div>
  )
}

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

// eslint-disable-next-line react-refresh/only-export-components
export const createSlides = (
  start,
  length = 10,
  shuffleFirstHalf = start !== 1,
  numbers,
) => {
  if (Array.isArray(numbers)) {
    return numbers
  }
  const seq = Array.from({ length }, (_, i) => start + i)
  const firstHalfCount = Math.min(5, seq.length)
  const firstHalf = seq.slice(0, firstHalfCount)
  const secondHalf = seq.slice(firstHalfCount)
  const first = shuffleFirstHalf ? shuffle(firstHalf) : firstHalf
  return [...first, ...secondHalf]
}

const MathModule = ({
  start,
  length = 10,
  shuffleFirstHalf,
  numbers,
  sum,
  difference,
  product,
  quotient,
}) => {
  const numberSlides = createSlides(start, length, shuffleFirstHalf, numbers)
  const additionSlides = sum
    ? [sum.a, sum.b, ...(sum.c !== undefined ? [sum.c] : []), sum.sum]
    : []
  const subtractionSlides = difference
    ? [
        difference.a,
        difference.b,
        ...(difference.c !== undefined ? [difference.c] : []),
        difference.difference,
      ]
    : []
  const multiplicationSlides = product ? [product.a, product.b, product.product] : []
  const divisionSlides = quotient ? [quotient.a, quotient.b, quotient.quotient] : []
  const slides = [
    ...numberSlides,
    ...additionSlides,
    ...subtractionSlides,
    ...multiplicationSlides,
    ...divisionSlides,
  ]

  const showCountingText =
    !sum && !difference && !product && !quotient && slides.length > 0

  let countingText = ''
  if (showCountingText) {
    const seq = Array.isArray(numbers)
      ? numbers
      : Array.from({ length }, (_, i) => start + i)
    const step = seq.length > 1 ? seq[1] - seq[0] : 1
    const absStep = Math.abs(step)
    const min = Math.min(...seq)
    const max = Math.max(...seq)
    countingText =
      absStep === 1
        ? `Count from ${min} to ${max}`
        : `Count in ${absStep}'s from ${min} to ${max}`
  }

  return (
    <div className="space-y-4 text-center">
      <Carousel
        items={slides}
        renderItem={(n) => <DotBoard count={n} />}
      />
      {showCountingText && (
        <div className="text-lg font-semibold text-white">{countingText}</div>
      )}
      {sum && (
        <div className="text-lg font-semibold text-white">
          {sum.a} + {sum.b}
          {sum.c !== undefined ? ` + ${sum.c}` : ''} = {sum.sum}
        </div>
      )}
      {difference && (
        <div className="text-lg font-semibold text-white">
          {difference.a} - {difference.b}
          {difference.c !== undefined ? ` - ${difference.c}` : ''} ={' '}
          {difference.difference}
        </div>
      )}
      {product && (
        <div className="text-lg font-semibold text-white">
          {product.a} × {product.b} = {product.product}
        </div>
      )}
      {quotient && (
        <div className="text-lg font-semibold text-white">
          {quotient.a} ÷ {quotient.b} = {quotient.quotient}
        </div>
      )}
    </div>
  )
}

export default MathModule
