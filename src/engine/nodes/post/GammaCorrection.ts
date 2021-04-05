/**
 * Adds a GammaCorrection effect
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext} from './_Base';
import {GammaCorrectionShader} from '../../../modules/three/examples/jsm/shaders/GammaCorrectionShader';
import {ShaderPass} from '../../../modules/three/examples/jsm/postprocessing/ShaderPass';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class GammaCorrectionPostParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new GammaCorrectionPostParamsConfig();
export class GammaCorrectionPostNode extends TypedPostProcessNode<ShaderPass, GammaCorrectionPostParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'gammaCorrection';
	}

	protected _createPass(context: TypedPostNodeContext) {
		const pass = new ShaderPass(GammaCorrectionShader);
		this.updatePass(pass);

		return pass;
	}
	updatePass(pass: ShaderPass) {}
}
