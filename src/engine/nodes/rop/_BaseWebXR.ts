// import {TypedRopNode} from './_Base';

// import {NodeParamsConfig} from '../utils/params/ParamsConfig';
// import type {BaseCoreWebXRController} from '../../../core/webXR/_BaseCoreWebXRController';
// import type {WebGLRenderer} from 'three';
// import type {PolyScene} from '../../scene/PolyScene';

// export abstract class BaseWebXRRopNode<K extends NodeParamsConfig> extends TypedRopNode<K> {
// 	override initializeNode() {
// 		super.initializeNode();
// 		this.io.outputs.setHasOneOutput();
// 	}

// 	protected setupRenderer(renderer: WebGLRenderer) {
// 		renderer.xr.enabled = true;
// 	}
// 	createXRControllerAndSetupRenderer(scene: PolyScene, renderer: WebGLRenderer, canvas: HTMLCanvasElement) {
// 		this.setupRenderer(renderer);
// 		return this.createXRController(scene, renderer, canvas);
// 	}

// 	protected abstract createXRController(
// 		scene: PolyScene,
// 		renderer: WebGLRenderer,
// 		canvas: HTMLCanvasElement
// 	): BaseCoreWebXRController;
// }
