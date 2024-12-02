import {useEffect, useRef, useState} from 'react';
import {useProtonEmitter} from './hooks/useProtonEmitter';
import './App.css';

function App() {
  const [animation, setAnimation] = useState<'fadeIn' | 'fadeOut'>('fadeIn');
  const text = 'hello';
  const colors = [{color: '#FF0000'}, {color: '#FFFFFF'}];
  const radius = 5;
  const speed = 5;
  const particles = 3000;
  const containerRef = useRef<HTMLDivElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  const {ref, triggerAnimation} = useProtonEmitter({
    text,
    colors,
    radius,
    speed,
    animation,
    particles,
  });

  function resizeText() {
    console.log('resizeText!');
    // const container = document.getElementById('container');
    // const span = document.getElementById('resizable-text');
    if (containerRef.current && spanRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      console.log({containerHeight, containerWidth});

      // Start with a large font size
      let fontSize = 300;
      spanRef.current.style.fontSize = fontSize + 'px';

      console.log({
        spanOffsetWidth: spanRef.current.offsetWidth,
        spanOffsetHeight: spanRef.current.offsetHeight,
      });

      // Reduce font size until it fits within the container
      while (
        spanRef.current.offsetWidth > containerWidth ||
        spanRef.current.offsetHeight > containerHeight
      ) {
        console.log({fontSize});
        fontSize--;
        spanRef.current.style.fontSize = fontSize + 'px';
      }
    }
  }

  useEffect(() => {
    if (spanRef.current && containerRef.current) {
      resizeText();
    }
  }, [spanRef.current, containerRef.current]);

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
          checked={animation === 'fadeIn'}
          onClick={() => setAnimation('fadeIn')}
        />

        <label htmlFor="fadeOut">Fade Out</label>
        <input
          type="radio"
          id="fadeOut"
          name="drone"
          value="fadeOut"
          checked={animation === 'fadeOut'}
          onClick={() => setAnimation('fadeOut')}
        />
      </fieldset>

      <div style={{display: 'flex', justifyContent: 'flex-end'}}>
        <button
          style={{backgroundColor: 'red'}}
          onClick={() => triggerAnimation()}
        >
          Trigger
        </button>
      </div>
      <div
        style={{
          backgroundColor: 'black',
          height: '400px',
          width: '400px',
          position: 'relative',
        }}
        id="container"
        ref={containerRef}
      >
        <canvas ref={ref} />
        <div
          style={{
            zIndex: 1000,
            display: 'inline-block',
            whiteSpace: 'nowrap',
            height: '100%',
            width: '100%',
            position: 'absolute',
            left: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <span
              ref={spanRef}
              style={{padding: '0px 16px', fontFamily: 'Arial'}}
            >
              {text}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
