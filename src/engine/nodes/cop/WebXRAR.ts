// /**
//  *
//  *
//  */
// import {Constructor} from '../../../types/GlobalTypes';
// import {TypedCopNode} from './_Base';
// import {NodeParamsConfig} from '../utils/params/ParamsConfig';
// import {CoreWebXRARController} from '../../../core/webXR/webXRAR/CoreWebXRARController';
// import {CoreSleep} from '../../../core/Sleep';
// import type {CanvasTexture, DataTexture} from 'three';

// export function WebXRARCopParamConfig<TBase extends Constructor>(Base: TBase) {
// 	return class Mixin extends Base {};
// }

// class WebXRARCopParamConfigCopParamsConfig extends WebXRARCopParamConfig(NodeParamsConfig) {}

// const ParamsConfig = new WebXRARCopParamConfigCopParamsConfig();

// export class WebXRARCopNode extends TypedCopNode<WebXRARCopParamConfigCopParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'webXRAR';
// 	}

// 	override async cook() {
// 		let arController: CoreWebXRARController | null = null;
// 		while ((arController = this.scene().webXR.activeARController()) == null) {
// 			await CoreSleep.sleep(1000);
// 		}
// 		let texture: CanvasTexture | DataTexture | undefined;
// 		while ((texture = arController.capture.texture()) == null) {
// 			await CoreSleep.sleep(1000);
// 		}
// 		console.log({texture});
// 		this.setTexture(texture);
// 	}
// }
