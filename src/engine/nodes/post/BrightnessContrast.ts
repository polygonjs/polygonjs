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
	/** @param brightness */
	brightness = ParamConfig.FLOAT(0, {
		range: [-1, 1],
		rangeLocked: [false, false],
		...PostParamOptions,
	});
	/** @param contrast */
	contrast = ParamConfig.FLOAT(0, {
		range: [-1, 1],
		rangeLocked: [false, false],
		...PostParamOptions,
	});
	/** @param transparent */
	transparent = ParamConfig.BOOLEAN(1, PostParamOptions);
}
const ParamsConfig = new BrightnessContrastPostParamsConfig();
export class BrightnessContrastPostNode extends TypedPostProcessNode<ShaderPass, BrightnessContrastPostParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'brightnessContrast';
	}

	protected _createPass(context: TypedPostNodeContext) {
		const pass = new ShaderPass(BrightnessContrastShader) as BrightnessContrastPassWithUniforms;
		// pass.clear = false;
		// (pass as any).clearAlpha = false;
		// (pass as any).clearColor = false;
		// (pass as any).clearDepth = false;
		(pass.fsQuad as any).material.transparent = true;
		this.updatePass(pass);

		return pass;
	}
	updatePass(pass: BrightnessContrastPassWithUniforms) {
		pass.uniforms.brightness.value = this.pv.brightness;
		pass.uniforms.contrast.value = this.pv.contrast;
		pass.material.transparent = this.pv.transparent;
	}
}
