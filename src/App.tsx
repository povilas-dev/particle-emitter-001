import {useCallback, useEffect, useRef, useState} from 'react';
import {useProtonEmitter} from './hooks/useProtonEmitter';
import './App.css';
import {AnimationType} from './interfaces';

function App() {
  const [animation, setAnimation] = useState<AnimationType>(
    AnimationType.FADE_IN
  );
  const text = '!!!';
  const colors = [{color: '#FF0000'}];
  const radius = 8;
  const speed = 4;
  const particleAmount = 3000;
  const svgTextRef = useRef<SVGSVGElement>(null);
  const [fontSize, setFontSize] = useState(100);
  const parentRef = useRef<HTMLDivElement>(null);

  const {canvasRef, triggerAnimation, resetAnimation} = useProtonEmitter({
    text,
    colors,
    radius,
    speed,
    animation,
    particleAmount,
    setFontSize,
    onAnimationEnd: (triggeredAnimation) => {
      if (svgTextRef.current) {
        if (triggeredAnimation === AnimationType.FADE_IN) {
          svgTextRef.current.classList.add('fade-in', 'one');
          svgTextRef.current.style.animationDuration = `${2 / speed}s`;
        }
      }
    },
  });

  const removeAnimationStyles = useCallback(() => {
    if (svgTextRef.current) {
      console.log('remove animation styles');
      svgTextRef.current.classList.remove('fade-in', 'fade-out', 'one');
    }
  }, []);

  const doReset = () => {
    removeAnimationStyles();
    resetAnimation();
  };

  const handleTriggerAnimation = () => {
    doReset();
    // If animation was fadeOut, we ant to trigger it right away
    if (animation === AnimationType.FADE_OUT) {
      if (svgTextRef.current) {
        svgTextRef.current.classList.add('fade-out', 'one');
      }
    }
    triggerAnimation();
  };

  useEffect(() => {
    if (parentRef.current && canvasRef.current) {
      const {width, height} = parentRef.current.getBoundingClientRect();

      canvasRef.current.width = width;
      canvasRef.current.height = height;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <fieldset style={{width: '250px'}}>
        <legend>Select animation type</legend>

        <label htmlFor="fadeIn">Fade In</label>
        <input
          type="radio"
          id="fadeIn"
          name="drone"
          value="fadeIn"
          checked={animation === AnimationType.FADE_IN}
          onClick={() => setAnimation(AnimationType.FADE_IN)}
        />

        <label htmlFor="fadeOut">Fade Out</label>
        <input
          type="radio"
          id="fadeOut"
          name="drone"
          value="fadeOut"
          checked={animation === AnimationType.FADE_OUT}
          onClick={() => setAnimation(AnimationType.FADE_OUT)}
        />
      </fieldset>

      <div style={{display: 'flex', justifyContent: 'flex-end'}}>
        <button
          style={{backgroundColor: 'red'}}
          onClick={handleTriggerAnimation}
        >
          Trigger
        </button>
      </div>
      <div
        ref={parentRef}
        style={{
          backgroundColor: 'black',
          height: '400px',
          width: '400px',
          position: 'relative',
        }}
      >
        <canvas ref={canvasRef} />
        <div
          style={{
            zIndex: 1000,
            display: 'inline-block',
            whiteSpace: 'nowrap',
            position: 'absolute',
            left: 0,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="400"
            height="400"
            viewBox="0 0 400 400"
            ref={svgTextRef}
            opacity={0}
          >
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="Arial"
              fontSize={`${fontSize}px`}
            >
              {text}
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default App;
