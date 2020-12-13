import {TypedPostProcessNode, PostParamOptions} from "./_Base";
import {HorizontalBlurShader as HorizontalBlurShader2} from "../../../modules/three/examples/jsm/shaders/HorizontalBlurShader";
import {ShaderPass as ShaderPass2} from "../../../modules/three/examples/jsm/postprocessing/ShaderPass";
import {UniformsUtils as UniformsUtils2} from "three/src/renderers/shaders/UniformsUtils";
import {Vector2 as Vector22} from "three/src/math/Vector2";
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
const uniforms = UniformsUtils2.clone(HorizontalBlurShader2.uniforms);
uniforms["delta"] = {value: new Vector22()};
const Shader = {
  uniforms,
  vertexShader: HorizontalBlurShader2.vertexShader,
  fragmentShader: [FRAGMENT, HorizontalBlurShader2.fragmentShader][0]
};
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class TriangleBlurPostParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.delta = ParamConfig.VECTOR2([2, 2], {
      ...PostParamOptions
    });
  }
}
const ParamsConfig2 = new TriangleBlurPostParamsConfig();
export class TriangleBlurPostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "triangle_blur";
  }
  _create_pass(context) {
    const pass = new ShaderPass2(Shader);
    pass.resolution = context.resolution.clone();
    this.update_pass(pass);
    return pass;
  }
  update_pass(pass) {
    pass.uniforms.delta.value.copy(this.pv.delta).divide(pass.resolution).multiplyScalar(window.devicePixelRatio);
  }
}
