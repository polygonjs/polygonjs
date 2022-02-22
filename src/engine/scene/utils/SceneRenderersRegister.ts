import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {PolyScene} from '../PolyScene';
import {Poly} from '../../Poly';

type Callback = (value: WebGLRenderer) => void;

export class SceneRenderersRegister {
	private _renderersById: Map<number, WebGLRenderer> = new Map();
	private _registerTimeByRenderer: Map<WebGLRenderer, number> = new Map();
	private _lastRegisteredRenderer: WebGLRenderer | undefined;
	private _resolves: Callback[] = [];

	constructor(protected scene: PolyScene) {}

	registerRenderer(renderer: WebGLRenderer) {
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
	deregisterRenderer(renderer: WebGLRenderer) {
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
		const renderers: WebGLRenderer[] = [];
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

	private _flushCallbacksWithRenderer(renderer: WebGLRenderer) {
		const callbacks: Callback[] = [];
		for (let r of this._resolves) {
			callbacks.push(r);
		}
		this._resolves = [];
		for (let c of callbacks) {
			c(renderer);
		}
	}

	async waitForRenderer(): Promise<WebGLRenderer> {
		if (this._lastRegisteredRenderer) {
			return this._lastRegisteredRenderer;
		} else {
			return new Promise((resolve, reject) => {
				this._resolves.push(resolve);
			});
		}
	}
}
