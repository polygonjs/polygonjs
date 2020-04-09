import {TypedPostProcessNode, TypedPostNodeContext, PostParamCallback} from './_Base';
import {ShaderPass} from '../../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import {BleachBypassShader} from '../../../../modules/three/examples/jsm/shaders/BleachBypassShader';

import {IUniform} from 'three/src/renderers/shaders/UniformsLib';

interface BleachPassWithUniforms extends ShaderPass {
	uniforms: {
		opacity: IUniform;
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
		callback: PostParamCallback,
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
