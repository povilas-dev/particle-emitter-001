import { useState } from 'react';
import { useProtonEmitter } from './hooks/useProtonEmitter';
import './App.css';

function App() {
  const [animation, setAnimation] = useState<'fadeIn' | 'fadeOut'>('fadeIn');
  const text = 'hells';
  const colors = [{ color: '#FF0000' }, { color: '#FFFFFF' }];
  const radius = 5;
  const speed = 5;
  const particles = 1000;

  const { ref, triggerAnimation } = useProtonEmitter({
    text,
    colors,
    radius,
    speed,
    animation,
    particles,
  });

  return (
    <div>
      <fieldset style={{ width: '250px' }}>
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

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          style={{ backgroundColor: 'red' }}
          onClick={() => triggerAnimation()}
        >
          Trigger
        </button>
      </div>
      <div
        style={{ backgroundColor: 'black', height: '400px', width: '400px' }}
      >
        <canvas ref={ref} />
      </div>
    </div>
  );
}

export default App;
