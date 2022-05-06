/**
 * Adds An AdaptiveToneMapping effect
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {AdaptiveToneMappingPass} from '../../../modules/three/examples/jsm/postprocessing/AdaptiveToneMappingPass';

// import VERTEX_SHADER from './gl/Adaptive.vert.glsl'
// import FRAGMENT_SHADER from './gl/Adaptive.frag.glsl'
// import {NoBlending} from 'three'

// const ADAPTIVE_LUMINANCE_MAT = new THREE.ShaderMaterial( {
// 	uniforms: {
// 		"map": { value: null }
// 	},
// 	vertexShader: VERTEX_SHADER,
// 	fragmentShader: FRAGMENT_SHADER,
// 	depthTest: false,
// 	// color: 0xffffff
// 	blending: NoBlending
// } );

// const CURRENT_LUMINANCE_MAT = new THREE.ShaderMaterial( {
// 	uniforms: {
// 		"map": { value: null }
// 	},
// 	vertexShader: VERTEX_SHADER,
// 	fragmentShader: FRAGMENT_SHADER,
// 	depthTest: false
// 	// color: 0xffffff
// 	// blending: THREE.NoBlending
// } );

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Vector2} from 'three';
class AdaptiveToneMappingPostParamsConfig extends NodeParamsConfig {
	/** @param adaptive */
	adaptive = ParamConfig.BOOLEAN(1, {
		...PostParamOptions,
	});
	/** @param averageLuminance */
	averageLuminance = ParamConfig.FLOAT(0.7, {
		...PostParamOptions,
	});
	/** @param midGrey */
	midGrey = ParamConfig.FLOAT(0.04, {
		...PostParamOptions,
	});
	/** @param maxLuminance */
	maxLuminance = ParamConfig.FLOAT(16, {
		range: [0, 20],
		...PostParamOptions,
	});
	/** @param adaptiveRange */
	adaptiveRange = ParamConfig.FLOAT(2, {
		range: [0, 10],
		...PostParamOptions,
	});
}
const ParamsConfig = new AdaptiveToneMappingPostParamsConfig();
export class AdaptiveToneMappingPostNode extends TypedPostProcessNode<
	AdaptiveToneMappingPass,
	AdaptiveToneMappingPostParamsConfig
> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'adaptiveToneMapping';
	}

	private _rendererSize = new Vector2();
	protected override _createPass(context: TypedPostNodeContext) {
		context.renderer.getSize(this._rendererSize);
		const pass = new AdaptiveToneMappingPass(this.pv.adaptive, this._rendererSize.x);
		this.updatePass(pass);
		return pass;
	}
	override updatePass(pass: AdaptiveToneMappingPass) {
		pass.setMaxLuminance(this.pv.maxLuminance);
		pass.setMiddleGrey(this.pv.midGrey);
		pass.setAverageLuminance(this.pv.averageLuminance);

		// if(pass.adaptive){
		// 	pass.setAdaptionRate( this.pv.adaptiveRange );
		// 	ADAPTIVE_LUMINANCE_MAT.uniforms[ "map" ].value = pass.luminanceRT;
		// 	CURRENT_LUMINANCE_MAT.uniforms[ "map" ].value = pass.currentLuminanceRT;
		// }
	}
}
