import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import tutorial1 from './assets/tutorial1.png'
import tutorial2 from './assets/tutorial2.png'
import tutorial3 from './assets/tutorial3.png'
import zoom1 from './assets/zoom1.png'
import zoom2 from './assets/zoom2.png'

const TUTORIAL_IMGS = [tutorial1, tutorial2, tutorial3]

/** 튜토리얼: 이미지 1→2→3 각 1초, 디졸브 전환 후 완료 시 onComplete */
function TutorialScreen({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    const t1 = setTimeout(() => setIndex(1), 1000)
    const t2 = setTimeout(() => setIndex(2), 2000)
    const t3 = setTimeout(() => onCompleteRef.current(), 3000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  const content = (
    <div className="tutorial-screen">
      <p className="tutorial-screen__resize-hint">잔 크기에 맞게 화면 크기를 조절해보세요!</p>
      <div className="tutorial-screen__images">
        <div className="tutorial-screen__main-wrap">
          <div className="tutorial-screen__img-slot">
            {TUTORIAL_IMGS.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="tutorial-screen__img"
                style={{ opacity: i === index ? 1 : 0 }}
                aria-hidden={i !== index}
              />
            ))}
          </div>
          <div className="tutorial-screen__zoom-wrap">
            <img
              src={zoom1}
              alt=""
              className="tutorial-screen__zoom-img"
              style={{ opacity: index === 0 ? 1 : 0 }}
              aria-hidden={index !== 0}
            />
            <img
              src={zoom2}
              alt=""
              className="tutorial-screen__zoom-img"
              style={{ opacity: index === 1 || index === 2 ? 1 : 0 }}
              aria-hidden={index !== 1 && index !== 2}
            />
          </div>
        </div>
      </div>
      <button
        type="button"
        className="tutorial-screen__skip"
        onClick={() => onCompleteRef.current()}
        aria-label="튜토리얼 건너뛰기"
      >
        건너뛰기
      </button>
    </div>
  )

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(content, document.body)
  }
  return content
}

export default TutorialScreen
