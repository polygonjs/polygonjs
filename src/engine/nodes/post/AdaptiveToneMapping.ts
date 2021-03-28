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
	adaptive = ParamConfig.BOOLEAN(1, {
		...PostParamOptions,
	});
	averageLuminance = ParamConfig.FLOAT(0.7, {
		...PostParamOptions,
	});
	midGrey = ParamConfig.FLOAT(0.04, {
		...PostParamOptions,
	});
	maxLuminance = ParamConfig.FLOAT(16, {
		range: [0, 20],
		...PostParamOptions,
	});
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
	paramsConfig = ParamsConfig;
	static type() {
		return 'adaptiveToneMapping';
	}

	protected _create_pass(context: TypedPostNodeContext) {
		const pass = new AdaptiveToneMappingPass(this.pv.adaptive, context.resolution.x);
		this.update_pass(pass);
		return pass;
	}
	update_pass(pass: AdaptiveToneMappingPass) {
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
