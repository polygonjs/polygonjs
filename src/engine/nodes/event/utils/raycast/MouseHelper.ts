export interface CursorOffset {
	offsetX: number;
	offsetY: number;
}
export interface CursorPage {
	pageX: number;
	pageY: number;
}

export class MouseHelperClass {
	private static _instance: MouseHelperClass;

	static instance() {
		return (this._instance = this._instance || new MouseHelperClass());
	}
	private constructor() {
		window.addEventListener('resize', this._resetCacheBound);
		document.addEventListener('scroll', this._resetCacheBound);
	}
	private _rectByCanvas: Map<HTMLCanvasElement, DOMRect> = new Map();

	setEventOffset(cursorPage: CursorPage, canvas: HTMLCanvasElement, offset: CursorOffset) {
		let rect = this._rectByCanvas.get(canvas);
		if (!rect) {
			rect = canvas.getBoundingClientRect();
			this._rectByCanvas.set(canvas, rect);
		}
		offset.offsetX = cursorPage.pageX - rect.left;
		offset.offsetY = cursorPage.pageY - rect.top;
	}

	private _resetCacheBound = this._resetCache.bind(this);
	private _resetCache() {
		this._rectByCanvas.clear();
	}
}

export const MouseHelper = MouseHelperClass.instance();
