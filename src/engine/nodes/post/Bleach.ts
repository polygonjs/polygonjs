import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {ShaderPass} from '../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import {BleachBypassShader} from '../../../modules/three/examples/jsm/shaders/BleachBypassShader';

import {IUniformN} from '../utils/code/gl/Uniforms';

interface BleachPassWithUniforms extends ShaderPass {
	uniforms: {
		opacity: IUniformN;
	};
}

// export function ParamF(name: string) {
// 	return function(target: any, propertyKey: string, descriptor: any) {
// 		console.log("A")
// 		// descriptor.get;
// 		return "a"
// 	};
// }

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class BleachPostParamsConfig extends NodeParamsConfig {
	opacity = ParamConfig.FLOAT(0.95, {
		range: [-5, 5],
		range_locked: [true, true],
		...PostParamOptions,
	});
}
const ParamsConfig = new BleachPostParamsConfig();
export class BleachPostNode extends TypedPostProcessNode<ShaderPass, BleachPostParamsConfig> {
	params_config = ParamsConfig;

	static type() {
		return 'bleach';
	}

	protected _create_pass(context: TypedPostNodeContext) {
		const pass = new ShaderPass(BleachBypassShader) as BleachPassWithUniforms;
		this.update_pass(pass);

		return pass;
	}
	update_pass(pass: BleachPassWithUniforms) {
		pass.uniforms.opacity.value = this.pv.opacity;
	}
}
