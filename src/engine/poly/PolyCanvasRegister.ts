// import {OffscreenCanvas} from 'three';
import {PolyEngine} from '../Poly';
import {AbstractRenderer} from '../viewers/Common';

type AvailableCanvas = HTMLCanvasElement; // | OffscreenCanvas;

export class PolyCanvasRegister {
	private _rendererByCanvas: Map<AvailableCanvas, AbstractRenderer | null> = new Map();
	constructor(public readonly poly: PolyEngine) {}

	findOrCreateCanvas() {
		const canvas = this._findAvailableCanvas() || this._createCanvas();
		return canvas;
	}
	private _findAvailableCanvas() {
		let foundCanvas: AvailableCanvas | undefined;
		this._rendererByCanvas.forEach((renderer, canvas) => {
			if (foundCanvas == null && renderer == null) {
				foundCanvas = canvas;
			}
		});
		return foundCanvas;
	}
	private _createCanvas() {
		return document.createElement('canvas');
	}
	registerCanvas(canvas: AvailableCanvas, renderer: AbstractRenderer) {
		this._rendererByCanvas.set(canvas, renderer);
	}
	deregisterCanvas(canvas: AvailableCanvas) {
		this._rendererByCanvas.set(canvas, null);
	}

	private _dummyCanvas: AvailableCanvas | undefined;
	dummyCanvas() {
		return this._dummyCanvas || (this._dummyCanvas = document.createElement('canvas'));
	}
}
