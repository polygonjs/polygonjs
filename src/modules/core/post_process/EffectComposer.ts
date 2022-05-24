import {Clock} from 'three';
import {LinearFilter} from 'three';
import {RGBAFormat} from 'three';
import {Vector2} from 'three';
import {WebGLRenderTarget} from 'three';
import {CopyShader} from '../../three/examples/jsm/shaders/CopyShader.js';
import {ShaderPass} from '../../three/examples/jsm/postprocessing/ShaderPass.js';
import {MaskPass} from '../../three/examples/jsm/postprocessing/MaskPass.js';
import {ClearMaskPass} from '../../three/examples/jsm/postprocessing/MaskPass.js';
import {Pass} from '../../three/examples/jsm/postprocessing/Pass.js';
import {WebGLRenderer} from 'three';
import {PassWithHooks} from './PassWithHooks';
import {Poly} from '../../../engine/Poly';

export class EffectComposer {
	private _pixelRatio: number;
	private _width: number;
	private _height: number;
	public renderTarget1: WebGLRenderTarget;
	public renderTarget2: WebGLRenderTarget;
	public writeBuffer: WebGLRenderTarget;
	public readBuffer: WebGLRenderTarget;
	public renderToScreen: boolean;
	public passes: Array<Pass | PassWithHooks> = [];
	private copyPass: ShaderPass;
	private clock = new Clock();
	constructor(public renderer: WebGLRenderer, renderTarget?: WebGLRenderTarget) {
		if (renderTarget === undefined) {
			const parameters = {
				minFilter: LinearFilter,
				magFilter: LinearFilter,
				format: RGBAFormat,
			};

			const size = renderer.getSize(new Vector2());
			this._pixelRatio = renderer.getPixelRatio();
			this._width = size.width;
			this._height = size.height;

			renderTarget = Poly.renderersController.renderTarget(this._width, this._height, parameters);
			renderTarget.texture.name = 'EffectComposer.rt1';
			if (this._pixelRatio > 0) {
				renderTarget.samples = this._pixelRatio;
			}
		} else {
			this._pixelRatio = 1;
			this._width = renderTarget.width;
			this._height = renderTarget.height;
		}

		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();
		this.renderTarget2.texture.name = 'EffectComposer.rt2';

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

		this.renderToScreen = true;

		this.passes = [];

		// dependencies

		if (CopyShader === undefined) {
			console.error('THREE.EffectComposer relies on CopyShader');
		}

		if (ShaderPass === undefined) {
			console.error('THREE.EffectComposer relies on ShaderPass');
		}

		this.copyPass = new ShaderPass(CopyShader);
	}

	swapBuffers() {
		const tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;
	}

	addPass(pass: Pass) {
		this.passes.push(pass);
		pass.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
	}

	insertPass(pass: Pass, index: number) {
		this.passes.splice(index, 0, pass);
		pass.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
	}

	removePass(pass: Pass) {
		const index = this.passes.indexOf(pass);

		if (index !== -1) {
			this.passes.splice(index, 1);
		}
	}
	clearPasses() {
		this.passes.splice(0, this.passes.length);
	}

	private _isLastEnabledPass(passIndex: number) {
		for (let i = passIndex + 1; i < this.passes.length; i++) {
			const pass = this.passes[i];
			let updatesRender = (pass as PassWithHooks).updatesRender;
			if (updatesRender == null) {
				updatesRender = true;
			}
			if (pass.enabled && updatesRender) {
				return false;
			}
		}

		return true;
	}

	render(deltaTime?: number) {
		// deltaTime value is in seconds

		if (deltaTime === undefined) {
			deltaTime = this.clock.getDelta();
		}

		const currentRenderTarget = this.renderer.getRenderTarget();

		let maskActive = false;

		for (let i = 0, il = this.passes.length; i < il; i++) {
			const pass = this.passes[i];

			if (pass.enabled === false) continue;

			let updatesRender = (pass as PassWithHooks).updatesRender;
			if (updatesRender == null) {
				updatesRender = true;
			}

			pass.renderToScreen = updatesRender && this.renderToScreen && this._isLastEnabledPass(i);
			pass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive);

			if (pass.needsSwap) {
				if (maskActive) {
					const context = this.renderer.getContext();
					const stencil = this.renderer.state.buffers.stencil;

					//context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );
					stencil.setFunc(context.NOTEQUAL, 1, 0xffffffff);

					this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive);

					//context.stencilFunc( context.EQUAL, 1, 0xffffffff );
					stencil.setFunc(context.EQUAL, 1, 0xffffffff);
				}

				this.swapBuffers();
			}

			if (MaskPass !== undefined) {
				if (pass instanceof MaskPass) {
					maskActive = true;
				} else if (pass instanceof ClearMaskPass) {
					maskActive = false;
				}
			}
		}

		this.renderer.setRenderTarget(currentRenderTarget);
	}

	reset(renderTarget: WebGLRenderTarget) {
		if (renderTarget === undefined) {
			const size = this.renderer.getSize(new Vector2());
			this._pixelRatio = this.renderer.getPixelRatio();
			this._width = size.width;
			this._height = size.height;

			renderTarget = this.renderTarget1.clone();
			renderTarget.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
		}

		this.renderTarget1.dispose();
		this.renderTarget2.dispose();
		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;
	}

	setSize(width: number, height: number) {
		this._width = width;
		this._height = height;

		const effectiveWidth = this._width * this._pixelRatio;
		const effectiveHeight = this._height * this._pixelRatio;

		this.renderTarget1.setSize(effectiveWidth, effectiveHeight);
		this.renderTarget2.setSize(effectiveWidth, effectiveHeight);

		for (let i = 0; i < this.passes.length; i++) {
			this.passes[i].setSize(effectiveWidth, effectiveHeight);
		}
	}

	setPixelRatio(pixelRatio: number) {
		this._pixelRatio = pixelRatio;

		this.setSize(this._width, this._height);
	}
}
