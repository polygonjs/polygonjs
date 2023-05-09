// /**
//  * Adds a GammaCorrection effect
//  *
//  *
//  */
// import {TypedPostNode, TypedPostNodeContext} from './_Base';
// import {GammaCorrectionShader} from 'three/examples/jsm/shaders/GammaCorrectionShader';
// import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass';

// import {NodeParamsConfig} from '../utils/params/ParamsConfig';
// class GammaCorrectionPostParamsConfig extends NodeParamsConfig {}
// const ParamsConfig = new GammaCorrectionPostParamsConfig();
// export class GammaCorrectionPostNode extends TypedPostNode<ShaderPass, GammaCorrectionPostParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'gammaCorrection';
// 	}

// 	protected override _createPass(context: TypedPostNodeContext) {
// 		const pass = new ShaderPass(GammaCorrectionShader);
// 		this.updatePass(pass);

// 		return pass;
// 	}
// 	override updatePass(pass: ShaderPass) {}
// }
