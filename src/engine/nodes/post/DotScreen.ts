import {TypedPostProcessNode, TypedPostNodeContext, PostParamCallback} from './_Base';
import {DotScreenShader} from '../../../../modules/three/examples/jsm/shaders/DotScreenShader';
import {ShaderPass} from '../../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';

interface DotScreenPassWithUniforms extends ShaderPass {
	uniforms: {
		center: IUniform;
		angle: IUniform;
		scale: IUniform;
	};
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class DotScreenPostParamsConfig extends NodeParamsConfig {
	center = ParamConfig.VECTOR2([0.5, 0.5], {
		callback: PostParamCallback,
	});
	angle = ParamConfig.FLOAT('$PI*0.5', {
		range: [0, 10],
		range_locked: [false, false],
		callback: PostParamCallback,
	});
	scale = ParamConfig.FLOAT(1.0, {
		range: [0, 1],
		range_locked: [false, false],
		callback: PostParamCallback,
	});
}
const ParamsConfig = new DotScreenPostParamsConfig();
export class DotScreenPostNode extends TypedPostProcessNode<ShaderPass, DotScreenPostParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'dot_screen';
	}

	protected _create_pass(context: TypedPostNodeContext) {
		const pass = new ShaderPass(DotScreenShader) as DotScreenPassWithUniforms;

		this.update_pass(pass);

		return pass;
	}
	update_pass(pass: DotScreenPassWithUniforms) {
		pass.uniforms.center.value = this.pv.center;
		pass.uniforms.angle.value = this.pv.angle;
		pass.uniforms.scale.value = this.pv.scale;
	}
}
