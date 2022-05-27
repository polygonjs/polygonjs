// /**
//  * Adds color correction
//  *
//  *
//  */
// import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
// import {ColorCorrectionShader} from '../../../modules/three/examples/jsm/shaders/ColorCorrectionShader';
// import {ShaderPass} from '../../../modules/three/examples/jsm/postprocessing/ShaderPass';
// import {IUniformV3} from '../utils/code/gl/Uniforms';

// interface ColorCorrectionPassWithUniforms extends ShaderPass {
// 	uniforms: {
// 		powRGB: IUniformV3;
// 		mulRGB: IUniformV3;
// 		addRGB: IUniformV3;
// 	};
// }

// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// class ColorCorrectionPostParamsConfig extends NodeParamsConfig {
// 	/** @param pow */
// 	pow = ParamConfig.VECTOR3([2, 2, 2], {
// 		...PostParamOptions,
// 	});
// 	/** @param mult */
// 	mult = ParamConfig.COLOR([1, 1, 1], {
// 		...PostParamOptions,
// 	});
// 	/** @param add */
// 	add = ParamConfig.COLOR([0, 0, 0], {
// 		...PostParamOptions,
// 	});
// }
// const ParamsConfig = new ColorCorrectionPostParamsConfig();
// export class ColorCorrectionPostNode extends TypedPostProcessNode<ShaderPass, ColorCorrectionPostParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'colorCorrection';
// 	}

// 	protected override _createPass(context: TypedPostNodeContext) {
// 		const pass = new ShaderPass(ColorCorrectionShader) as ColorCorrectionPassWithUniforms;
// 		this.updatePass(pass);
// 		return pass;
// 	}
// 	override updatePass(pass: ColorCorrectionPassWithUniforms) {
// 		pass.uniforms.powRGB.value.copy(this.pv.pow);
// 		pass.uniforms.mulRGB.value.set(this.pv.mult.r, this.pv.mult.g, this.pv.mult.b);
// 		pass.uniforms.addRGB.value.set(this.pv.add.r, this.pv.add.g, this.pv.add.b);
// 	}
// }
