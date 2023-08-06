import {DataTexture, Vector2, Color} from 'three';
import FontFaceObserver from 'fontfaceobserver';

function colorStyleWithAlpha(color: Color, alpha: number): string {
	const rgb = color.getStyle();
	const elements = rgb.split('(')[1].split(')')[0].split(',');
	return `rgba(${elements[0]},${elements[1]},${elements[2]},${alpha})`;
}

interface WriteTextToCanvasOptions {
	texture: DataTexture;
	text: string;
	fontFamily: string;
	fontSize: number;
	resolution: Vector2;
	bgColor: Color;
	bgAlpha: number;
	textColor: Color;
	textAlpha: number;
}
interface LoadAndUseFontOtions extends WriteTextToCanvasOptions {
	fontUrl: string;
}

function writeTextToCanvas(options: WriteTextToCanvasOptions) {
	const {texture, text, fontSize, resolution, bgColor, bgAlpha, textColor, textAlpha, fontFamily} = options;
	const canvas = document.createElement('canvas');
	canvas.width = resolution.x;
	canvas.height = resolution.y;
	const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

	// draw bg
	ctx.fillStyle = colorStyleWithAlpha(bgColor, bgAlpha);
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// draw text
	ctx.font = fontFamily;
	ctx.fillStyle = colorStyleWithAlpha(textColor, textAlpha);

	let usedFontSize = fontSize;
	const metrix = () => ctx.measureText(text);
	const usedFont = () => `${usedFontSize}px ${fontFamily}`;
	const textWidth = (m: TextMetrics) => m.width;
	const textHeight = (m: TextMetrics) => m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
	const isFontTooLarge = (m: TextMetrics) => {
		return textWidth(m) > canvas.width || textHeight(m) > canvas.height;
	};
	// reduce the font size until the text is contained in the canvas
	ctx.font = usedFont();
	let m = metrix();
	while (isFontTooLarge(m)) {
		usedFontSize--;
		ctx.font = usedFont();
		m = metrix();
	}
	const positionX = (canvas.width - textWidth(m)) / 2;
	const positionY = (canvas.height + textHeight(m) / 2) / 2;
	ctx.fillText(text, positionX, positionY);

	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

	texture.source.data = imageData;
	texture.needsUpdate = true;
}

export async function loadAndUseFont(options: LoadAndUseFontOtions) {
	const {fontFamily, fontUrl} = options;

	const font = new FontFaceObserver(fontFamily);

	try {
		// Create a new stylesheet
		const style = document.createElement('style');
		document.head.appendChild(style);

		// Inject font-face rule
		style.sheet?.insertRule(
			`
    @font-face {
      font-family: '${fontFamily}';
      src: url('${fontUrl}');
    }
  `,
			0
		);
		// Wait for font to be loaded
		await font.load();

		writeTextToCanvas({
			...options,
		});
		// Use the loaded font
		// const writer = new CanvasTextWriter({resolution});
		// writer.writeText(text, '50px ' + fontFamily, 'black');
	} catch (err) {
		console.log(`Font is not available: ${err}`);
	}
}

// loadAndUseFont('MyCustomFont', 'path-to-your-font/your-font-file.woff', 'yourCanvasId', 'Hello, World!', 800, 600);
