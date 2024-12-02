import Proton from 'proton-engine';

export const initializeProton = (
  canvas: HTMLCanvasElement
): { proton: Proton; emitter: Proton.Emitter } => {
  const proton = new Proton();
  const emitter = new Proton.Emitter({ life: Infinity, dead: false });
  const renderer = new Proton.CanvasRenderer(canvas);
  proton.addRenderer(renderer);
  return { proton, emitter };
};

export const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

export const createSvgText = (canvas: HTMLCanvasElement, text: string) => {
  // Create a temporary SVG to measure text dimensions
  const measureSvg = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg'
  );
  const measureText = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'text'
  );
  measureText.setAttribute('font-family', 'Arial');
  measureText.setAttribute('font-size', '100px'); // Use 100px as base size for measurement
  measureText.textContent = text;
  measureSvg.appendChild(measureText);
  document.body.appendChild(measureSvg);

  // Get text measurements
  const bbox = measureText.getBBox();
  document.body.removeChild(measureSvg);

  // Calculate scaling factors
  const textRatio = bbox.width / bbox.height;
  const canvasRatio = canvas.width / canvas.height;

  // Determine fontSize based on both width and height constraints
  let fontSize;
  if (textRatio > canvasRatio) {
    // Text is wider relative to height than canvas
    fontSize = (canvas.width * 0.8) / textRatio;
  } else {
    // Text is taller relative to width than canvas
    fontSize = canvas.height * 0.8;
  }

  const svg = `
      <svg xmlns="http://www.w3.org/2000/svg"
        width="${canvas.width}" 
        height="${canvas.height}"
        viewBox="0 0 ${canvas.width} ${canvas.height}">
          <text
            x="50%"
            y="50%"
            text-anchor="middle"
            dominant-baseline="middle"
            font-family="Arial"
            font-size="${fontSize}px"
          >${text}</text>
      </svg>
    `;

  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  return URL.createObjectURL(svgBlob);
};

// Helper function to clamp values
export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
