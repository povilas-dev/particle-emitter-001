import {useRef, useState} from 'react';
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

  const {ref, triggerAnimation} = useProtonEmitter({
    text,
    colors,
    radius,
    speed,
    animation,
    particles,
  });

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
            position: 'absolute',
            left: 0,
          }}
        >
          <svg
            id="my-text-svg"
            xmlns="http://www.w3.org/2000/svg"
            width="400"
            height="400"
            viewBox="0 0 400 400"
          >
            <text
              // className="fade-in one"
              // id="my-text-element"
              fill="#FFFFFF"
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="Arial"
              fontSize="168.874px"
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
