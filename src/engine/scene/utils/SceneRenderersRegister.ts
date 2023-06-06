import {PolyScene} from '../PolyScene';
import {Poly} from '../../Poly';
import {AbstractRenderer} from '../../viewers/Common';
import {WebGLRenderer} from 'three';
import type {PathTracingRendererContainer} from '../../nodes/rop/utils/pathTracing/PathTracingRendererContainer';

type SceneRenderersRegisterCallback = (value: AbstractRenderer) => void;

export interface RegisterRendererOptions {
	assignId: boolean;
}
export class SceneRenderersRegister {
	private _renderersById: Map<number, AbstractRenderer> = new Map();
	private _registerTimeByRenderer: Map<AbstractRenderer, number> = new Map();
	private _lastRegisteredRenderer: AbstractRenderer | undefined;
	private _resolves: SceneRenderersRegisterCallback[] = [];

	constructor(protected scene: PolyScene) {}

	registerRenderer(renderer: AbstractRenderer, options?: RegisterRendererOptions) {
		let assignId = true;
		if (options?.assignId == false) {
			assignId = false;
		}
		if (assignId) {
			Poly.renderersController.assignIdToRenderer(renderer);
		}

		const id = Poly.renderersController.rendererId(renderer);
		if (id == null) {
			return;
		}

		this._renderersById.set(id, renderer);
		this._registerTimeByRenderer.set(renderer, performance.now());
		// Poly.renderersController._registerRenderer(renderer, this.scene);
		this._updateCache();

		if (this._renderersById.size == 1) {
			this._flushCallbacksWithRenderer(renderer);
		}
	}
	deregisterRenderer(renderer: AbstractRenderer) {
		const id = Poly.renderersController.rendererId(renderer);
		if (id == null) {
			return;
		}
		this._renderersById.delete(id);

		renderer.dispose();
		this._updateCache();
		// Poly.renderersController._deregisterRenderer(renderer);
	}
	lastRegisteredRenderer() {
		return this._lastRegisteredRenderer;
	}

	renderers() {
		const renderers: AbstractRenderer[] = [];
		this._renderersById.forEach((renderer) => {
			renderers.push(renderer);
		});
		return renderers;
	}

	private _updateCache() {
		this._lastRegisteredRenderer = undefined;
		this._registerTimeByRenderer.forEach((registerTime, renderer) => {
			if (this._lastRegisteredRenderer == undefined) {
				this._lastRegisteredRenderer = renderer;
			} else {
				const lastRegisterTime = this._registerTimeByRenderer.get(this._lastRegisteredRenderer);
				if (lastRegisterTime != null) {
					if (registerTime > lastRegisterTime) {
						this._lastRegisteredRenderer = renderer;
					}
				}
			}
		});
	}

	private _flushCallbacksWithRenderer(renderer: AbstractRenderer) {
		const callbacks: SceneRenderersRegisterCallback[] = [];
		for (let r of this._resolves) {
			callbacks.push(r);
		}
		this._resolves = [];
		for (let c of callbacks) {
			c(renderer);
		}
	}

	async waitForAbstractRenderer(): Promise<AbstractRenderer> {
		if (this._lastRegisteredRenderer) {
			return this._lastRegisteredRenderer;
		} else {
			return new Promise((resolve, reject) => {
				this._resolves.push(resolve);
			});
		}
	}
	async waitForRenderer(): Promise<WebGLRenderer | undefined> {
		let renderer = await this.waitForAbstractRenderer();
		if (renderer instanceof WebGLRenderer) {
			return renderer;
		}
		renderer = (renderer as PathTracingRendererContainer).webGLRenderer;
		if (renderer && renderer instanceof WebGLRenderer) {
			return renderer;
		}
		if (renderer) {
			if (!(renderer instanceof WebGLRenderer)) {
				console.log('unexpected renderer:', {renderer});
			}
		}
	}
}
