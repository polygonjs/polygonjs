// /**
//  * Adds a FXAA effect
//  *
//  *
//  */
// import {TypedPostNode, TypedPostNodeContext, PostParamOptions} from './_Base';
// import {FXAAShader} from '../../../modules/three/examples/jsm/shaders/FXAAShader';
// import {ShaderPass} from '../../../modules/three/examples/jsm/postprocessing/ShaderPass';
// import {IUniformV2} from '../utils/code/gl/Uniforms';

// interface FXAAPassWithUniforms extends ShaderPass {
// 	uniforms: {
// 		resolution: IUniformV2;
// 	};
// }

// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {Vector2} from 'three';
// class FXAAPostParamsConfig extends NodeParamsConfig {
// 	/** @param transparent */
// 	transparent = ParamConfig.BOOLEAN(1, PostParamOptions);
// }
// const ParamsConfig = new FXAAPostParamsConfig();
// export class FXAAPostNode extends TypedPostNode<ShaderPass, FXAAPostParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'FXAA';
// 	}
// 	private _rendererSize = new Vector2();
// 	protected override _createPass(context: TypedPostNodeContext) {
// 		context.renderer.getSize(this._rendererSize);
// 		const pass = new ShaderPass(FXAAShader) as FXAAPassWithUniforms;
// 		pass.uniforms.resolution.value.set(1 / this._rendererSize.x, 1 / this._rendererSize.y);
// 		pass.material.transparent = true;
// 		this.updatePass(pass);

// 		return pass;
// 	}
// 	override updatePass(pass: FXAAPassWithUniforms) {
// 		pass.material.transparent = this.pv.transparent;
// 	}
// }
