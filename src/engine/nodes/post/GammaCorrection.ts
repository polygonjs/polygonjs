import {TypedPostProcessNode, TypedPostNodeContext} from './_Base';
import {GammaCorrectionShader} from '../../../../modules/three/examples/jsm/shaders/GammaCorrectionShader';
import {ShaderPass} from '../../../../modules/three/examples/jsm/postprocessing/ShaderPass';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class GammaCorrectionPostParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new GammaCorrectionPostParamsConfig();
export class GammaCorrectionPostNode extends TypedPostProcessNode<ShaderPass, GammaCorrectionPostParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'gamma_correction';
	}

	protected _create_pass(context: TypedPostNodeContext) {
		const pass = new ShaderPass(GammaCorrectionShader);
		this.update_pass(pass);

		return pass;
	}
	update_pass(pass: ShaderPass) {}
}
