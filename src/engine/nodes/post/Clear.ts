// /**
//  * Clears the previous buffer.
//  *
//  *
//  */
// import {TypedPostNode, TypedPostNodeContext} from './_Base';
// import {ClearPass} from '../../../modules/three/examples/jsm/postprocessing/ClearPass';

// import {NodeParamsConfig} from '../utils/params/ParamsConfig';
// class ClearPostParamsConfig extends NodeParamsConfig {}
// const ParamsConfig = new ClearPostParamsConfig();
// export class ClearPostNode extends TypedPostNode<ClearPass, ClearPostParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'clear';
// 	}

// 	protected override _createPass(context: TypedPostNodeContext) {
// 		const pass = new ClearPass();
// 		this.updatePass(pass);

// 		return pass;
// 	}
// 	override updatePass(pass: ClearPass) {}
// }
