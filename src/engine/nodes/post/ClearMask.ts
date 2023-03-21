// import {TypedPostNode, TypedPostNodeContext} from './_Base';
// import {ClearMaskPass} from 'three/examples/jsm/postprocessing/MaskPass';

// import {NodeParamsConfig} from '../utils/params/ParamsConfig';
// class ClearMaskPostParamsConfig extends NodeParamsConfig {}
// const ParamsConfig = new ClearMaskPostParamsConfig();
// export class ClearMaskPostNode extends TypedPostNode<ClearMaskPass, ClearMaskPostParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'clearMask';
// 	}

// 	protected override _createPass(context: TypedPostNodeContext) {
// 		const pass = new ClearMaskPass();
// 		this.updatePass(pass);

// 		return pass;
// 	}
// 	override updatePass(pass: ClearMaskPass) {}
// }
