// /**
//  * Creates a WebXR VR (Virtual Reality) Configuration, to be used by a WebGLRenderer node
//  *
//  *
//  */
// import {RopType} from '../../poly/registers/nodes/types/Rop';

// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {BaseWebXRRopNode} from './_BaseWebXR';
// import {CoreVRController} from '../../../core/xr/CoreVRController';
// import type {WebGLRenderer} from 'three';
// import type {PolyScene} from '../../scene/PolyScene';
// import {isBooleanTrue} from '../../../core/Type';
// import {DEFAULT_WEBXR_VR_REFERENCE_SPACE_TYPE, WEBXR_VR_REFERENCE_SPACE_TYPES} from '../../../core/xr/Common';

// class WebXRARRopParamsConfig extends NodeParamsConfig {
// 	/** @param overrides referenceSpaceType */
// 	overrideReferenceSpaceType = ParamConfig.BOOLEAN(0);
// 	/** @param set referenceSpaceType ( see doc: https://immersive-web.github.io/webxr/#xrreferencespace-interface ) */
// 	referenceSpaceType = ParamConfig.INTEGER(
// 		WEBXR_VR_REFERENCE_SPACE_TYPES.indexOf(DEFAULT_WEBXR_VR_REFERENCE_SPACE_TYPE),
// 		{
// 			menu: {
// 				entries: WEBXR_VR_REFERENCE_SPACE_TYPES.map((name, value) => ({name, value})),
// 			},
// 			visibleIf: {
// 				overrideReferenceSpaceType: 1,
// 			},
// 		}
// 	);
// }
// const ParamsConfig = new WebXRARRopParamsConfig();

// export class WebXRVRRopNode extends BaseWebXRRopNode<WebXRARRopParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type(): Readonly<RopType.WEBXRVR> {
// 		return RopType.WEBXRVR;
// 	}

// 	protected override setupRenderer(renderer: WebGLRenderer) {
// 		super.setupRenderer(renderer);
// 		if (isBooleanTrue(this.pv.overrideReferenceSpaceType)) {
// 			renderer.xr.setReferenceSpaceType(WEBXR_VR_REFERENCE_SPACE_TYPES[this.pv.referenceSpaceType]);
// 		} else {
// 			renderer.xr.setReferenceSpaceType(DEFAULT_WEBXR_VR_REFERENCE_SPACE_TYPE);
// 		}
// 	}

// 	protected createXRController(scene: PolyScene, renderer: WebGLRenderer, canvas: HTMLCanvasElement) {
// 		return new CoreVRController(scene, renderer, canvas);
// 	}
// }
