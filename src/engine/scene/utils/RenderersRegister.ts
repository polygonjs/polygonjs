//
// Not using a renderers register yet
// but it should help solve the env map not being usable
// when switching cameras.
// I suspect the best strategy will be to have an env map registers
// and when a renderer is being created, all existing env maps should be set for it
//
// import {PolyScene} from '../..';
// import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';

// export class RenderersRegister {
// 	private _renderers_by_id: Map<number, WebGLRenderer> = new Map();
// 	constructor(protected scene: PolyScene) {}

// 	register_renderer(renderer: WebGLRenderer) {
// 		this._renderers_by_id.set(renderer.id, renderer);
// 	}
// 	unregister_renderer(renderer: WebGLRenderer) {
// 		this._renderers_by_id.delete(renderer.id);
// 		renderer.dispose()
// 	}
// 	traverse_renderers(callback: (viewer: WebGLRenderer) => void) {
// 		this._renderers_by_id.forEach(callback);
// 	}
// }
