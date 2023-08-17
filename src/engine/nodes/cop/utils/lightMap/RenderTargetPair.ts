import {RENDER_TARGET_DEFAULT_SIZE, renderTargetType, renderTargetFormat} from './Common';
import {WebGLRenderTarget} from 'three';
export class RenderTargetPair {
	private pingPong = false;
	private RT1 = new WebGLRenderTarget(RENDER_TARGET_DEFAULT_SIZE, RENDER_TARGET_DEFAULT_SIZE, {
		type: renderTargetType,
		format: renderTargetFormat,
	});
	private RT2 = new WebGLRenderTarget(RENDER_TARGET_DEFAULT_SIZE, RENDER_TARGET_DEFAULT_SIZE, {
		type: renderTargetType,
		format: renderTargetFormat,
	});
	constructor() {}
	setSize(x: number, w: number) {
		this.RT1.setSize(x, w);
		this.RT2.setSize(x, w);
	}
	toggle() {
		this.pingPong = !this.pingPong;
	}
	previous() {
		return this.pingPong ? this.RT1 : this.RT2;
	}
	current() {
		return this.pingPong ? this.RT2 : this.RT1;
	}
}
