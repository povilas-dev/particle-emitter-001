import {useCallback, useEffect, useRef, useState} from 'react';
import {configureEmitter} from './configureEmitter';
import {createSvgText, loadImage, initializeProton} from './helpers';
import debounce from 'debounce';
import {OnAnimationEndType} from '../interfaces';

export const useProtonEmitter = ({
  text,
  colors,
  radius,
  speed,
  animation,
  particleAmount,
  onAnimationEnd,
  setFontSize,
}: {
  text: string;
  colors: Array<{color: string}>;
  radius: number;
  speed: number;
  animation: 'fadeIn' | 'fadeOut';
  particleAmount: number;
  onAnimationEnd?: OnAnimationEndType;
  setFontSize: (val: number) => void;
}) => {
  // Canvas and Proton refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const protonRef = useRef<any | null>(null);
  const emitterRef = useRef<any | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const configRef = useRef<Record<string, any> | null>(null);
  const animationHandlingRef = useRef<any | null>(null);

  // Animation and state refs
  const requestAnimationFrameRef = useRef<any>(null);
  const isSubscribedToUpdates = useRef(false);

  // SVG URL ref
  const urlRef = useRef<string | null>(null);

  // Initialization state
  const [isInitialized, setIsInitialized] = useState(false);

  // Animation frame update loop
  const subscribeToUpdates = useCallback(() => {
    const update = () => {
      protonRef.current.update();
      requestAnimationFrameRef.current = requestAnimationFrame(update);
    };
    update();
  }, []);

  // Create SVG text element

  // Handle canvas resize and particle system setup
  const emitParticles = useCallback(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext('2d', {willReadFrequently: true});

    // Cleanup previous URL if exists
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
    }

    // Cancel previous animation frame if running
    if (isSubscribedToUpdates.current) {
      cancelAnimationFrame(requestAnimationFrameRef.current);
      isSubscribedToUpdates.current = false;
    }

    // Clear canvas and reset particle system
    context?.clearRect(0, 0, canvas.width, canvas.height);
    emitterRef.current.removeAllParticles();
    emitterRef.current.initializes = [];
    emitterRef.current.behaviours = [];

    // Create and store new SVG URL

    const {url, fontSize} = createSvgText(canvas, configRef.current?.text);
    setFontSize(fontSize);
    urlRef.current = url;

    // Load image and configure emitter
    loadImage(url).then((img) => {
      protonRef.current.removeEmitter(emitterRef.current);

      const {emitter, initialize, trigger, reset} = configureEmitter({
        canvas,
        emitter: emitterRef.current,
        context: context!,
        img,
        colors: configRef.current?.colors,
        radius: configRef.current?.radius,
        speed: configRef.current?.speed,
        animation: configRef.current?.animation,
        particleAmount: configRef.current?.particleAmount,
        onAnimationEnd: configRef.current?.onAnimationEnd,
      });

      animationHandlingRef.current = {trigger, reset};
      protonRef.current.addEmitter(emitter);
      initialize();
      setIsInitialized(true);

      if (!isSubscribedToUpdates.current) {
        subscribeToUpdates();
        isSubscribedToUpdates.current = true;
      }
    });
  }, [subscribeToUpdates]);

  // Setup and cleanup effects
  useEffect(() => {
    let parentElement: Element | null = null;

    if (canvasRef.current) {
      const canvas = canvasRef.current;
      parentElement = canvas.parentElement;

      if (!canvas || !parentElement) {
        return;
      }

      const {proton, emitter} = initializeProton(canvas);

      protonRef.current = proton;
      emitterRef.current = emitter;

      // Handle canvas resizing
      const resizeCanvas = debounce(() => {
        if (!canvas || !parentElement) {
          return;
        }

        const {width, height} = parentElement.getBoundingClientRect();

        canvas.width = width;
        canvas.height = height;

        emitParticles();
      }, 150);

      // Setup resize observer
      resizeObserverRef.current = new ResizeObserver(resizeCanvas);
      resizeObserverRef.current.observe(parentElement);
    }

    // Cleanup function
    return () => {
      if (protonRef.current) {
        protonRef.current.destroy(true);
        protonRef.current = null;
      }
      if (parentElement && resizeObserverRef.current) {
        resizeObserverRef.current.unobserve(parentElement);
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
      if (requestAnimationFrameRef.current) {
        cancelAnimationFrame(requestAnimationFrameRef.current);
        requestAnimationFrameRef.current = null;
      }
    };
  }, [emitParticles, isInitialized]);

  useEffect(() => {
    configRef.current = {
      text,
      colors,
      radius,
      speed,
      animation,
      particleAmount,
      onAnimationEnd,
    };
    emitParticles();
  }, [
    text,
    colors,
    radius,
    speed,
    emitParticles,
    animation,
    particleAmount,
    onAnimationEnd,
  ]);

  return {
    canvasRef,
    triggerAnimation: () => {
      if (isInitialized && animationHandlingRef.current) {
        animationHandlingRef.current.trigger();
      }
    },
    resetAnimation: () => {
      if (isInitialized && animationHandlingRef.current) {
        animationHandlingRef.current.reset();
      }
    },
    isInitialized,
  };
};
