/**
 * Adds a vertical blur effect.
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {VerticalBlurShader} from '../../../modules/three/examples/jsm/shaders/VerticalBlurShader';
import {ShaderPass} from '../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import {IUniformN} from '../utils/code/gl/Uniforms';

interface VerticalBlurPassWithUniforms extends ShaderPass {
	uniforms: {
		v: IUniformN;
	};
	resolution_y: number;
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Vector2} from 'three';
class VerticalBlurPostParamsConfig extends NodeParamsConfig {
	/** @param amount */
	amount = ParamConfig.FLOAT(2, {
		range: [0, 10],
		rangeLocked: [true, false],
		step: 0.01,
		...PostParamOptions,
	});
	/** @param transparent */
	transparent = ParamConfig.BOOLEAN(1, PostParamOptions);
}
const ParamsConfig = new VerticalBlurPostParamsConfig();
export class VerticalBlurPostNode extends TypedPostProcessNode<ShaderPass, VerticalBlurPostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'verticalBlur';
	}

	private _rendererSize = new Vector2();
	protected override _createPass(context: TypedPostNodeContext) {
		const pass = new ShaderPass(VerticalBlurShader) as VerticalBlurPassWithUniforms;
		context.renderer.getSize(this._rendererSize);
		pass.resolution_y = this._rendererSize.y;
		this.updatePass(pass);

		return pass;
	}
	override updatePass(pass: VerticalBlurPassWithUniforms) {
		pass.uniforms.v.value = this.pv.amount / (pass.resolution_y * window.devicePixelRatio);
		pass.material.transparent = this.pv.transparent;
	}
}
