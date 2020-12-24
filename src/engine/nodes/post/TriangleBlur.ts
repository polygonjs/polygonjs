/**
 * Adds a triangle blur.
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {HorizontalBlurShader} from '../../../modules/three/examples/jsm/shaders/HorizontalBlurShader';
import {ShaderPass} from '../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import {IUniformV2, IUniformN} from '../utils/code/gl/Uniforms';
import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
import {Vector2} from 'three/src/math/Vector2';

interface TriangleBlurPassWithUniforms extends ShaderPass {
	uniforms: {
		delta: IUniformV2;
		h: IUniformN;
	};
	resolution: Vector2;
}

const FRAGMENT = `
#include <common>
#define ITERATIONS 10.0
uniform sampler2D tDiffuse;
uniform vec2 delta;
varying vec2 vUv;
void main() {
	vec4 color = vec4( 0.0 );
	float total = 0.0;
	float offset = rand( vUv );
	for ( float t = -ITERATIONS; t <= ITERATIONS; t ++ ) {
		float percent = ( t + offset - 0.5 ) / ITERATIONS;
		float weight = 1.0 - abs( percent );
		color += texture2D( tDiffuse, vUv + delta * percent ) * weight;
		total += weight;
	}
	gl_FragColor = color / total;
}`;
const uniforms = UniformsUtils.clone(HorizontalBlurShader.uniforms);
uniforms['delta'] = {value: new Vector2()};
const Shader = {
	uniforms: uniforms,
	vertexShader: HorizontalBlurShader.vertexShader,
	fragmentShader: [FRAGMENT, HorizontalBlurShader.fragmentShader][0],
};

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';

class TriangleBlurPostParamsConfig extends NodeParamsConfig {
	delta = ParamConfig.VECTOR2([2, 2], {
		...PostParamOptions,
	});
}
const ParamsConfig = new TriangleBlurPostParamsConfig();
export class TriangleBlurPostNode extends TypedPostProcessNode<ShaderPass, TriangleBlurPostParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'triangle_blur';
	}

	protected _create_pass(context: TypedPostNodeContext) {
		const pass = new ShaderPass(Shader) as TriangleBlurPassWithUniforms;
		pass.resolution = context.resolution.clone();
		this.update_pass(pass);

		return pass;
	}
	update_pass(pass: TriangleBlurPassWithUniforms) {
		pass.uniforms.delta.value.copy(this.pv.delta).divide(pass.resolution).multiplyScalar(window.devicePixelRatio);
	}
}
