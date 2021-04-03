import PCSS from './glsl/PCSS.glsl';
import PCSSGetShadow from './glsl/PCSSGetShadow.glsl';
import SHADOW_MAP_PARS_FRAGMENT from 'three/src/renderers/shaders/ShaderChunk/shadowmap_pars_fragment.glsl';

export class PCSSController {
	static filterFragmentShader(fragmentShader: string) {
		let shadowParsFragmentModified = SHADOW_MAP_PARS_FRAGMENT;
		shadowParsFragmentModified = shadowParsFragmentModified.replace(
			'#ifdef USE_SHADOWMAP',
			`#ifdef USE_SHADOWMAP
${PCSS}
				`
		);

		shadowParsFragmentModified = shadowParsFragmentModified.replace(
			'#if defined( SHADOWMAP_TYPE_PCF )',
			`
				${PCSSGetShadow}
				#if defined( SHADOWMAP_TYPE_PCF )`
		);

		fragmentShader = fragmentShader.replace('#include <shadowmap_pars_fragment>', shadowParsFragmentModified);

		return fragmentShader;
	}
}
