import {BaseViewer} from '../_Base';

export class WebGLController {
	public request_animation_frame_id: number;

	constructor(protected viewer: BaseViewer) {}

	init() {
		this.viewer.canvas.onwebglcontextlost = this._on_webglcontextlost.bind(this);
		this.viewer.canvas.onwebglcontextrestored = this._on_webglcontextrestored.bind(this);
	}

	protected _on_webglcontextlost(event: Event) {
		console.warn('context lost at frame', this.viewer.scene.frame);
		event.preventDefault();
		cancelAnimationFrame(this.request_animation_frame_id);
		console.warn('not canceled', this.request_animation_frame_id);
	}
	protected _on_webglcontextrestored(event: Event) {
		console.log('context restored', event);
	}
}
