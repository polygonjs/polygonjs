/*
This replaces THREE's font, so that we can have one shape per character
*/

import {Shape, ShapePath} from 'three';
import {PolyDictionary} from '../../../types/GlobalTypes';

interface Glyph {
	_cachedOutline: any[];
	ha: number;
	o: string;
}

export interface FontData {
	resolution: number;
	boundingBox: {
		yMax: number;
		yMin: number;
	};
	underlineThickness: number;
	glyphs: PolyDictionary<Glyph>;
	familyName: string;
}
const isCCW = false;

export class Font {
	public readonly isFont = true;
	public readonly type = 'font';
	constructor(private data: FontData) {}

	generateShapes(text: string, size: number = 100) {
		const allShapes: Array<Shape[]> = [];
		const allPaths = createPaths(text, size, this.data);

		for (let pathsForChar of allPaths) {
			const shapesForChar: Shape[] = [];
			for (let path of pathsForChar) {
				Array.prototype.push.apply(shapesForChar, path.toShapes(isCCW));
			}
			allShapes.push(shapesForChar);
		}

		return allShapes;
	}
}

function createPaths(text: string, size: number, data: FontData) {
	const chars = Array.from(text);
	const scale = size / data.resolution;
	const lineHeight = (data.boundingBox.yMax - data.boundingBox.yMin + data.underlineThickness) * scale;

	const allPaths: Array<ShapePath[]> = [];

	let offsetX = 0,
		offsetY = 0;

	for (let i = 0; i < chars.length; i++) {
		const char = chars[i];

		const pathsForChar: ShapePath[] = [];
		if (char === '\n') {
			offsetX = 0;
			offsetY -= lineHeight;
		} else {
			const ret = createPath(char, scale, offsetX, offsetY, data);
			if (ret) {
				offsetX += ret.offsetX;
				pathsForChar.push(ret.path);
			}
		}
		allPaths.push(pathsForChar);
	}

	return allPaths;
}

function createPath(char: string, scale: number, offsetX: number, offsetY: number, data: FontData) {
	const glyph = data.glyphs[char] || data.glyphs['?'];

	if (!glyph) {
		console.error('THREE.Font: character "' + char + '" does not exists in font family ' + data.familyName + '.');

		return;
	}

	const path = new ShapePath();

	let x, y, cpx, cpy, cpx1, cpy1, cpx2, cpy2;

	if (glyph.o) {
		const outline = glyph._cachedOutline || (glyph._cachedOutline = glyph.o.split(' '));

		for (let i = 0, l = outline.length; i < l; ) {
			const action = outline[i++];

			switch (action) {
				case 'm': // moveTo
					x = outline[i++] * scale + offsetX;
					y = outline[i++] * scale + offsetY;

					path.moveTo(x, y);

					break;

				case 'l': // lineTo
					x = outline[i++] * scale + offsetX;
					y = outline[i++] * scale + offsetY;

					path.lineTo(x, y);

					break;

				case 'q': // quadraticCurveTo
					cpx = outline[i++] * scale + offsetX;
					cpy = outline[i++] * scale + offsetY;
					cpx1 = outline[i++] * scale + offsetX;
					cpy1 = outline[i++] * scale + offsetY;

					path.quadraticCurveTo(cpx1, cpy1, cpx, cpy);

					break;

				case 'b': // bezierCurveTo
					cpx = outline[i++] * scale + offsetX;
					cpy = outline[i++] * scale + offsetY;
					cpx1 = outline[i++] * scale + offsetX;
					cpy1 = outline[i++] * scale + offsetY;
					cpx2 = outline[i++] * scale + offsetX;
					cpy2 = outline[i++] * scale + offsetY;

					path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, cpx, cpy);

					break;
			}
		}
	}

	return {offsetX: glyph.ha * scale, path: path};
}
