// /**
//  * Creates a WebXR AR (Augmented Reality) Configuration, to be used by a WebGLRenderer node
//  *
//  *
//  */
// import {RopType} from '../../poly/registers/nodes/types/Rop';

// import {NodeParamsConfig} from '../utils/params/ParamsConfig';
// import type {PolyScene} from '../../scene/PolyScene';
// import type {WebGLRenderer} from 'three';
// import {CoreARController} from '../../../core/xr/CoreARController';
// import {BaseWebXRRopNode} from './_BaseWebXR';

// class WebXRARRopParamsConfig extends NodeParamsConfig {}
// const ParamsConfig = new WebXRARRopParamsConfig();

// export class WebXRARRopNode extends BaseWebXRRopNode<WebXRARRopParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type(): Readonly<RopType.WEBXRAR> {
// 		return RopType.WEBXRAR;
// 	}

// 	protected createXRController(scene: PolyScene, renderer: WebGLRenderer, canvas: HTMLCanvasElement) {
// 		return new CoreARController(scene, renderer, canvas);
// 	}
// }
