// import {TypedPostNode, TypedPostNodeContext, PostParamOptions} from './_Base';
// import {CopyShader} from 'three/examples/jsm/shaders/CopyShader';
// import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass';
// import {IUniformN} from '../utils/code/gl/Uniforms';
// interface CopyPassWithUniforms extends ShaderPass {
// 	uniforms: {
// 		opacity: IUniformN;
// 	};
// }

// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// class CopyPostParamsConfig extends NodeParamsConfig {
// 	opacity = ParamConfig.FLOAT(1, {
// 		range: [0, 1],
// 		rangeLocked: [true, true],
// 		...PostParamOptions,
// 	});
// 	transparent = ParamConfig.BOOLEAN(1, PostParamOptions);
// }
// const ParamsConfig = new CopyPostParamsConfig();
// export class CopyPostNode extends TypedPostNode<ShaderPass, CopyPostParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'copy';
// 	}

// 	protected override _createPass(context: TypedPostNodeContext) {
// 		const pass = new ShaderPass(CopyShader) as CopyPassWithUniforms;
// 		this.updatePass(pass);

// 		return pass;
// 	}
// 	override updatePass(pass: CopyPassWithUniforms) {
// 		pass.uniforms.opacity.value = this.pv.opacity;
// 		pass.material.transparent = this.pv.transparent;
// 	}
// }
