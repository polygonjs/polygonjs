/**
 * Adds An AdaptativeToneMapping effect
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {AdaptiveToneMappingPass} from '../../../modules/three/examples/jsm/postprocessing/AdaptiveToneMappingPass';

// import VERTEX_SHADER from './gl/Adaptive.vert.glsl'
// import FRAGMENT_SHADER from './gl/Adaptive.frag.glsl'
// import {NoBlending} from 'three/src/constants'

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
class AdaptiveToneMappingPostParamsConfig extends NodeParamsConfig {
	adaptative = ParamConfig.BOOLEAN(1, {
		...PostParamOptions,
	});
	average_luminance = ParamConfig.FLOAT(0.7, {
		...PostParamOptions,
	});
	mid_grey = ParamConfig.FLOAT(0.04, {
		...PostParamOptions,
	});
	max_luminance = ParamConfig.FLOAT(16, {
		range: [0, 20],
		...PostParamOptions,
	});
	adaption_rage = ParamConfig.FLOAT(2, {
		range: [0, 10],
		...PostParamOptions,
	});
}
const ParamsConfig = new AdaptiveToneMappingPostParamsConfig();
export class AdaptiveToneMappingPostNode extends TypedPostProcessNode<
	AdaptiveToneMappingPass,
	AdaptiveToneMappingPostParamsConfig
> {
	params_config = ParamsConfig;
	static type() {
		return 'adaptive_tone_mapping';
	}

	protected _create_pass(context: TypedPostNodeContext) {
		const pass = new AdaptiveToneMappingPass(this.pv.adaptative, context.resolution.x);
		this.update_pass(pass);
		return pass;
	}
	update_pass(pass: AdaptiveToneMappingPass) {
		pass.setMaxLuminance(this.pv.max_luminance);
		pass.setMiddleGrey(this.pv.mid_grey);
		pass.setAverageLuminance(this.pv.average_luminance);

		// if(pass.adaptive){
		// 	pass.setAdaptionRate( this.pv.adaption_rage );
		// 	ADAPTIVE_LUMINANCE_MAT.uniforms[ "map" ].value = pass.luminanceRT;
		// 	CURRENT_LUMINANCE_MAT.uniforms[ "map" ].value = pass.currentLuminanceRT;
		// }
	}
}
