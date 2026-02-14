import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import maintextImg from './assets/maintext.png'
import mainimg from './assets/mainimg.png'
import smallimg from './assets/smallimg.png'
import sliderbt from './assets/sliderbt.png'
import './App.css'

function getTouchDistance(touches: { length: number; 0?: Touch; 1?: Touch }): number {
  if (touches.length < 2 || touches[0] == null || touches[1] == null) return 0
  const a = touches[0]
  const b = touches[1]
  return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
}

/** 1페이지: 맥주 8 소주 2, 2페이지: 맥주 7 소주 3, 3페이지: 맥주 1 소주 9 */
const RESULT_LABEL_NUMS: Record<1 | 2 | 3, { yellow: string; green: string }> = {
  1: { yellow: '8', green: '2' },
  2: { yellow: '7', green: '3' },
  3: { yellow: '1', green: '9' },
}

function ResultScreen({
  resultStep,
  ratio,
}: {
  resultStep: 1 | 2 | 3
  ratio: { yellow: number; green: number }
}) {
  const [scale, setScale] = useState(1)
  const [showResultHint, setShowResultHint] = useState(true)
  const wrapRef = useRef<HTMLDivElement>(null)
  const pinchStart = useRef<{ distance: number; scale: number } | null>(null)
  const scaleRef = useRef(scale)
  scaleRef.current = scale
  const nums = RESULT_LABEL_NUMS[resultStep]
  const showLabels = scale >= 0.99

  useEffect(() => {
    const t = setTimeout(() => setShowResultHint(false), 3000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const opts = { passive: false } as const

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        pinchStart.current = {
          distance: getTouchDistance(e.touches),
          scale: scaleRef.current,
        }
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        if (pinchStart.current) {
          const dist = getTouchDistance(e.touches)
          if (pinchStart.current.distance === 0) return
          const r = dist / pinchStart.current.distance
          const next = pinchStart.current.scale * r
          setScale(Math.min(1, Math.max(0.25, next)))
        }
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinchStart.current = null
    }

    el.addEventListener('touchstart', onTouchStart, opts)
    el.addEventListener('touchmove', onTouchMove, opts)
    el.addEventListener('touchend', onTouchEnd, opts)
    el.addEventListener('touchcancel', onTouchEnd, opts)

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [])

  return (
    <div ref={wrapRef} className="result-screen">
      {showResultHint && (
        <div className="result-screen__hint-box" aria-live="polite">
          잔 크기에 맞게 화면 크기를 조절해보세요
        </div>
      )}
      <div
        className="result-screen__scale-wrap"
        style={{
          transform: `translateX(-50%) scale(${scale})`,
        }}
      >
        <div
          className={`result-screen__yellow${ratio.yellow === 1 ? ' result-screen__yellow--narrow' : ''}`}
          style={{ flex: ratio.yellow }}
        >
          <div
            className="result-screen__label-wrap"
            style={{
              opacity: showLabels ? 1 : 0,
              visibility: showLabels ? 'visible' : 'hidden',
            }}
          >
            <span className="result-screen__label-text" aria-hidden>맥주</span>
            <span className="result-screen__label-num" aria-hidden>{nums.yellow}</span>
          </div>
        </div>
        <div
          className="result-screen__rect"
          style={{ flex: ratio.green }}
        >
          <div
            className="result-screen__label-wrap"
            style={{
              opacity: showLabels ? 1 : 0,
              visibility: showLabels ? 'visible' : 'hidden',
            }}
          >
            <span className="result-screen__label-text" aria-hidden>소주</span>
            <span className="result-screen__label-num" aria-hidden>{nums.green}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const MARQUEE_TEXT = '소맥을 완벽하게 즐기는 법'
const BLUR_BY_STEP = [0, 3, 3] // 1단계: 0, 2단계(기분좋게!): 3, 3단계(화끈하게!): 0
const SLIDER_POSITIONS = [25, 50, 75] // 원과 핸들이 25%, 50%, 75%에 맞춤
/** 노란:초록 높이 비율 — 1: 8:2, 2: 7:3, 3: 1:9 */
const RESULT_RATIO: Record<1 | 2 | 3, { yellow: number; green: number }> = {
  1: { yellow: 8, green: 2 },
  2: { yellow: 7, green: 3 },
  3: { yellow: 1, green: 9 },
}

const FIRST_SCREEN_IMAGES = [maintextImg, mainimg, smallimg, sliderbt]

function App() {
  const [page, setPage] = useState<'intro' | 'slider' | 'result'>('intro')
  const [sliderValue, setSliderValue] = useState(25) // 25, 50, 75
  const [resultStep, setResultStep] = useState<1 | 2 | 3>(1)
  const [thumbPosition, setThumbPosition] = useState<{ left: number; top: number } | null>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    FIRST_SCREEN_IMAGES.forEach((src) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      document.head.appendChild(link)
    })
  }, [])

  const handleIntroClick = () => {
    setPage('slider')
    const url = window.location.pathname + window.location.search + '#slider'
    window.history.pushState({ page: 'slider' }, '', url)
  }
  const handleSliderScreenClick = () => {
    const stepIndex = SLIDER_POSITIONS.indexOf(sliderValue)
    setResultStep((stepIndex >= 0 ? stepIndex : 0) + 1 as 1 | 2 | 3)
    setPage('result')
    const url = window.location.pathname + window.location.search + '#result'
    window.history.pushState({ page: 'result' }, '', url)
  }

  useEffect(() => {
    const base = window.location.pathname + window.location.search
    window.history.replaceState({ page: 'intro' }, '', base + '#intro')
  }, [])

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      const fromState = e.state?.page as string | undefined
      const fromHash = window.location.hash.replace(/^#/, '')
      const next = (fromState === 'slider' || fromHash === 'slider'
        ? 'slider'
        : fromState === 'result' || fromHash === 'result'
          ? 'result'
          : 'intro') as 'intro' | 'slider' | 'result'
      setPage(next)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    const snapped = SLIDER_POSITIONS.reduce((prev, curr) =>
      Math.abs(curr - v) < Math.abs(prev - v) ? curr : prev
    )
    setSliderValue(snapped)
  }

  const blurStepIndex = SLIDER_POSITIONS.indexOf(sliderValue)
  const blurAmount = BLUR_BY_STEP[blurStepIndex >= 0 ? blurStepIndex : 0]

  const SLIDER_LABELS = ['가볍게!', '기분좋게!', '화끈하게!!!!']

  const updateThumbPosition = React.useCallback(() => {
    const bar = barRef.current
    if (!bar) return
    const dots = bar.querySelectorAll<HTMLElement>('.slider-screen__dot')
    const dotIndex = SLIDER_POSITIONS.indexOf(sliderValue)
    if (dotIndex < 0 || dotIndex >= dots.length) return
    const dot = dots[dotIndex]
    const barRect = bar.getBoundingClientRect()
    const dotRect = dot.getBoundingClientRect()
    const centerX = dotRect.left + dotRect.width / 2 - barRect.left
    const centerY = barRect.height / 2
    setThumbPosition({ left: centerX, top: centerY })
  }, [sliderValue])

  // 노란 삼각형 thumb: 각 원의 정중앙(getBoundingClientRect) + 검정 바의 세로 중앙 기준으로 배치
  useLayoutEffect(() => {
    if (page !== 'slider') return
    updateThumbPosition()
    const bar = barRef.current
    if (!bar) return
    const ro = new ResizeObserver(updateThumbPosition)
    ro.observe(bar)
    return () => ro.disconnect()
  }, [page, sliderValue, updateThumbPosition])

  if (page === 'result') {
    return (
      <ResultScreen
        resultStep={resultStep}
        ratio={RESULT_RATIO[resultStep]}
      />
    )
  }

  if (page === 'slider') {
    const isFireStep = sliderValue === 75 /* 화끈하게! */
    return (
      <div className={`slider-screen${isFireStep ? ' slider-screen--fire' : ''}`}>
        <h2 className="slider-screen__title">얼만큼 마실래?</h2>
        <div className="slider-screen__top">
          <div className="slider-screen__image-wrap">
            <div
              className="slider-screen__image"
              style={{ filter: `blur(${blurAmount}px)` }}
            >
              <img src={smallimg} alt="" />
            </div>
            <p className="slider-screen__hint">슬라이더를 넘겨 선택해봐!</p>
          </div>
        </div>
        <div className="slider-screen__bar-wrap">
          <div className="slider-screen__bar" ref={barRef}>
            <div className="slider-screen__dots">
              <span className="slider-screen__dot" />
              <span className="slider-screen__dot" />
              <span className="slider-screen__dot" />
            </div>
            <input
              type="range"
              className="slider-screen__input"
              min={0}
              max={100}
              step={1}
              value={sliderValue}
              onChange={handleSliderChange}
              onClick={(e) => e.stopPropagation()}
              aria-label="음주량 선택"
            />
            {thumbPosition !== null && (
              <div
                className="slider-screen__thumb"
                style={{
                  left: thumbPosition.left,
                  top: thumbPosition.top,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <img src={sliderbt} alt="" />
              </div>
            )}
          </div>
          <div className="slider-screen__labels">
            {SLIDER_LABELS.map((label) => (
              <span key={label} className="slider-screen__label">{label}</span>
            ))}
          </div>
          <button
            type="button"
            className="slider-screen__cta"
            onClick={(e) => {
              e.stopPropagation()
              handleSliderScreenClick()
            }}
            aria-label="마시자! 다음으로"
          >
            <svg width="94" height="39" viewBox="0 0 94 39" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="0.397436" y="0.397436" width="92.359" height="38.1026" rx="50" fill="black"/>
              <rect x="0.397436" y="0.397436" width="92.359" height="38.1026" rx="50" stroke="black" strokeWidth="0.794872"/>
              <path d="M28.0751 12.5725V23.2474H20.4369V12.5725H28.0751ZM21.8527 13.7462V22.0551H26.622V13.7462H21.8527ZM32.5649 10.8958V17.5094H35.3407V18.7763H32.5649V27.4577H31.1118V10.8958H32.5649ZM42.122 15.3484C42.1033 18.3664 44.1713 21.4217 46.6118 22.5208L45.7175 23.6759C43.8359 22.7537 42.2058 20.8069 41.414 18.4409C40.6409 20.9466 39.0108 23.0332 37.0733 24.0112L36.1418 22.7817C38.6009 21.6452 40.6502 18.4968 40.6689 15.3484V12.3303H42.122V15.3484ZM49.8906 10.8958V27.495H48.4189V10.8958H49.8906ZM58.3299 15.9818C58.3113 18.6458 60.2302 21.5707 62.6334 22.7071L61.7951 23.8622C59.9321 22.9586 58.3579 20.9839 57.622 18.739C56.8582 21.1795 55.1908 23.3219 53.3371 24.272L52.4429 23.117C54.8275 21.962 56.8768 18.8135 56.8954 15.9818V13.8207H53.039V12.6098H62.0559V13.8207H58.3299V15.9818ZM65.5396 10.8958V17.6026H68.3155V18.8508H65.5396V27.4577H64.0865V10.8958H65.5396ZM71.8924 12.4607L71.762 22.1482H70.1971L70.0667 12.4607H71.8924ZM70.9796 26.0605C70.3275 26.0605 69.7686 25.5202 69.7872 24.8496C69.7686 24.1975 70.3275 23.6573 70.9796 23.6573C71.6316 23.6573 72.1719 24.1975 72.1719 24.8496C72.1719 25.5202 71.6316 26.0605 70.9796 26.0605Z" fill="#FEC901"/>
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="first-screen" onClick={handleIntroClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleIntroClick()}>
      <div className="marquee">
        <div className="marquee__inner">
          <span className="marquee__text">{MARQUEE_TEXT}</span>
          <span className="marquee__text">{MARQUEE_TEXT}</span>
          <span className="marquee__text">{MARQUEE_TEXT}</span>
        </div>
      </div>
      <img src={maintextImg} alt="메인 텍스트" className="first-screen__maintext" fetchPriority="high" />
      <img src={mainimg} alt="메인 이미지" className="first-screen__mainimg" fetchPriority="high" />
      <div className="first-screen__touch-hint-box">
        <span className="first-screen__touch-hint-text">화면을 터치해 시작해보세요</span>
      </div>
    </div>
  )
}

export default App
