/**
 * Adds a brightness/contrast
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {BrightnessContrastShader} from '../../../modules/three/examples/jsm/shaders/BrightnessContrastShader';
import {ShaderPass} from '../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import {IUniformN} from '../utils/code/gl/Uniforms';

interface BrightnessContrastPassWithUniforms extends ShaderPass {
	uniforms: {
		brightness: IUniformN;
		contrast: IUniformN;
	};
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class BrightnessContrastPostParamsConfig extends NodeParamsConfig {
	brightness = ParamConfig.FLOAT(0, {
		range: [-1, 1],
		range_locked: [false, false],
		...PostParamOptions,
	});
	contrast = ParamConfig.FLOAT(0, {
		range: [-1, 1],
		range_locked: [false, false],
		...PostParamOptions,
	});
	transparent = ParamConfig.BOOLEAN(1, PostParamOptions);
}
const ParamsConfig = new BrightnessContrastPostParamsConfig();
export class BrightnessContrastPostNode extends TypedPostProcessNode<ShaderPass, BrightnessContrastPostParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'brightnessContrast';
	}

	protected _create_pass(context: TypedPostNodeContext) {
		const pass = new ShaderPass(BrightnessContrastShader) as BrightnessContrastPassWithUniforms;
		// pass.clear = false;
		// (pass as any).clearAlpha = false;
		// (pass as any).clearColor = false;
		// (pass as any).clearDepth = false;
		console.log('brightness', pass);
		(pass.fsQuad as any).material.transparent = true;
		this.update_pass(pass);

		return pass;
	}
	update_pass(pass: BrightnessContrastPassWithUniforms) {
		pass.uniforms.brightness.value = this.pv.brightness;
		pass.uniforms.contrast.value = this.pv.contrast;
		pass.material.transparent = this.pv.transparent;
	}
}
