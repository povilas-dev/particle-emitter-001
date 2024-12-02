// @ts-nocheck
import Proton from 'proton-engine';
import { clamp } from './helpers';

const ANGLE_INCREMENT = 0.02;
const MAX_ORBIT_RADIUS = 9;

const animationTypeToBehaviour = {
  fadeIn: ({
    radius,
    speed,
    canvas,
    textZone,
  }: {
    radius: number;
    speed: number;
    canvas: HTMLCanvasElement;
    textZone: Proton.ImageZone;
  }) => ({
    initialize(particle: any) {
      // Set random radius within allowed limit
      particle.R =
        Math.random() * Math.min(MAX_ORBIT_RADIUS, canvas.width / 150);

      // Set initial random angle and clone text position from text zone
      particle.Angle = Math.random() * Math.PI * 2;
      particle.textPosition = textZone.getPosition().clone();
      particle.velocity = speed / 100;

      // Clamp text position within canvas bounds
      particle.textPosition.x = clamp(particle.textPosition.x, 0, canvas.width);
      particle.textPosition.y = clamp(
        particle.textPosition.y,
        0,
        canvas.height
      );

      // Set initial particle properties
      particle.radius = radius * 0.2;
      particle.alpha = 1;
      particle.spreadFactor = 0;
    },
    applyBehaviour(particle: any) {
      // Increment the angle to create orbital motion
      particle.Angle += ANGLE_INCREMENT;

      // Calculate target position based on current angle
      const targetX =
        particle.textPosition.x + particle.R * Math.cos(particle.Angle);
      const targetY =
        particle.textPosition.y + particle.R * Math.sin(particle.Angle);

      // Gradually move the particle towards the target position
      particle.p.x += (targetX - particle.p.x) * particle.velocity;
      particle.p.y += (targetY - particle.p.y) * particle.velocity;
    },
  }),
  fadeOut: ({
    radius,
    canvas,
    textZone,
    speed,
  }: {
    radius: number;
    speed: number;
    canvas: HTMLCanvasElement;
    textZone: Proton.ImageZone;
  }) => ({
    initialize(particle: any) {
      // Set random radius within allowed limit
      particle.R =
        Math.random() * Math.min(MAX_ORBIT_RADIUS, canvas.width / 150);

      // Set initial random angle and clone text position from text zone
      particle.Angle = Math.random() * Math.PI * 2;
      particle.textPosition = textZone.getPosition().clone();

      // Clamp text position within canvas bounds
      particle.textPosition.x = clamp(particle.textPosition.x, 0, canvas.width);
      particle.textPosition.y = clamp(
        particle.textPosition.y,
        0,
        canvas.height
      );

      // Set initial particle properties
      particle.radius = radius * 0.2;
      particle.alpha = 1;

      // Set a random angle offset for spread effect
      particle.randomAngleOffset = (Math.random() - 0.5) * Math.PI;
      particle.sinusoidalOffset = Math.random() * Math.PI * 2; // Random phase for sinusoidal movement

      // Set a random target direction for more random movement
      particle.randomDirection = {
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
      };
    },
    applyBehaviour(particle: any) {
      particle.Angle += ANGLE_INCREMENT;

      if (particle.shouldSpread) {
        // Normalize the random direction
        const magnitude = Math.sqrt(
          particle.randomDirection.x * particle.randomDirection.x +
            particle.randomDirection.y * particle.randomDirection.y
        );

        if (magnitude !== 0) {
          const normalizedDirectionX = particle.randomDirection.x / magnitude;
          const normalizedDirectionY = particle.randomDirection.y / magnitude;

          // Add subtle random variation to the movement
          const randomness = 0.1;
          const randX = (Math.random() - 0.5) * randomness;
          const randY = (Math.random() - 0.5) * randomness;

          particle.p.x += (normalizedDirectionX + randX) * speed;
          particle.p.y += (normalizedDirectionY + randY) * speed;
        }

        // Check if the particle has reached the edge
        if (
          particle.p.x <= 0 ||
          particle.p.x >= canvas.width ||
          particle.p.y <= 0 ||
          particle.p.y >= canvas.height
        ) {
          particle.dead = true; // Mark particle as dead
        }
      } else {
        const targetX =
          particle.textPosition.x + particle.R * Math.cos(particle.Angle);
        const targetY =
          particle.textPosition.y + particle.R * Math.sin(particle.Angle);

        particle.p.x = targetX;
        particle.p.y = targetY;
      }
    },
  }),
};

const animationHandlersMapByAnimation = {
  fadeIn: (emitter: Proton.Emitter) => ({
    initialize: () => {},
    trigger: () => {
      // Remove all particles and emit once to start the fade-in animation
      emitter.removeAllParticles();
      emitter.emit('once');
    },
    reset: () => {
      // Remove all particles to reset the animation
      emitter.removeAllParticles();
    },
  }),
  fadeOut: (emitter: Proton.Emitter) => ({
    initialize: () => {
      // Emit particles once to initialize the fade-out animation
      emitter.emit('once');
    },
    trigger: () => {
      // Set particles to spread out and reset properties for fade-out effect
      emitter.particles.forEach((particle: any) => {
        particle.shouldSpread = true;
        particle.spreadFactor = 0;
        particle.alpha = 1;
      });
    },
    reset: () => {
      // Remove all particles and emit once to reset the fade-out animation
      emitter.removeAllParticles();
      emitter.particles.forEach((particle: any) => {
        particle.shouldSpread = false;
        particle.spreadFactor = 1;
        particle.alpha = 0;
      });
      emitter.emit('once');
    },
  }),
};

export const configureEmitter = ({
  canvas,
  emitter,
  context,
  img,
  colors,
  radius,
  speed,
  animation,
  particles,
}: {
  canvas: HTMLCanvasElement;
  emitter: any;
  context: CanvasRenderingContext2D;
  img: HTMLImageElement;
  colors: Array<Record<string, { color: string }>>;
  radius: number;
  speed: number;
  animation: 'fadeIn' | 'fadeOut';
  particles: number;
}) => {
  // Draw the provided image onto the canvas
  context?.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Define a rectangular zone slightly larger than the canvas to accommodate particle movement
  const rect = new Proton.Rectangle(
    0 - 50,
    0 - 50,
    canvas.width + 100,
    canvas.height + 100
  ) as unknown as {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  // Get the image data from the canvas to define the text zone
  const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
  const textZone = new Proton.ImageZone(imageData, 0, 0);

  // Initialize particle positions within the defined rectangular zone
  emitter.addInitialize(
    new Proton.P(new Proton.RectZone(rect.x, rect.y, rect.width, rect.height))
  );

  // Set the emission rate - number of particles per span
  emitter.rate = new Proton.Rate(new Proton.Span(particles));

  // Extract colors from the provided color objects or use a default color if none are provided
  const colorsArray = Array.isArray(colors)
    ? colors.map(({ color }) => color).filter((value) => value !== null)
    : ['#00aeff'];

  // Add color behavior to particles
  emitter.addBehaviour(new Proton.Color(colorsArray));

  // Add animation-specific behavior to particles
  emitter.addBehaviour(
    animationTypeToBehaviour[animation]({ radius, speed, canvas, textZone })
  );

  // Retrieve handlers for the specified animation type
  const handlers = animationHandlersMapByAnimation[animation](emitter);

  return { emitter, ...handlers };
};
