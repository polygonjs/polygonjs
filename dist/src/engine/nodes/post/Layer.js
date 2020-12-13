import {TypedPostProcessNode} from "./_Base";
import {Pass as Pass2} from "../../../modules/three/examples/jsm/postprocessing/Pass";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
import {EffectComposer as EffectComposer2} from "../../../modules/three/examples/jsm/postprocessing/EffectComposer";
import {LinearFilter, RGBAFormat} from "three/src/constants";
import {ShaderMaterial as ShaderMaterial2} from "three/src/materials/ShaderMaterial";
import {UniformsUtils as UniformsUtils2} from "three/src/renderers/shaders/UniformsUtils";
import VERTEX from "./gl/default.vert.glsl";
import FRAGMENT from "./gl/Layer.frag.glsl";
import {Poly as Poly2} from "../../Poly";
const SHADER = {
  uniforms: {
    tDiffuse: {value: null},
    texture1: {value: null},
    texture2: {value: null},
    h: {value: 1 / 512}
  },
  vertexShader: VERTEX,
  fragmentShader: FRAGMENT
};
class LayerPass extends Pass2 {
  constructor(_composer1, _composer2) {
    super();
    this._composer1 = _composer1;
    this._composer2 = _composer2;
    this.uniforms = UniformsUtils2.clone(SHADER.uniforms);
    this.material = new ShaderMaterial2({
      uniforms: this.uniforms,
      vertexShader: SHADER.vertexShader,
      fragmentShader: SHADER.fragmentShader,
      transparent: true
    });
    this.fsQuad = new Pass2.FullScreenQuad(this.material);
  }
  render(renderer, writeBuffer) {
    this._composer1.render();
    this._composer2.render();
    this.uniforms.texture1.value = this._composer1.readBuffer.texture;
    this.uniforms.texture2.value = this._composer2.readBuffer.texture;
    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear)
        renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);
      this.fsQuad.render(renderer);
    }
  }
}
class LayerPostParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new LayerPostParamsConfig();
export class LayerPostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "layer";
  }
  initialize_node() {
    super.initialize_node();
    this.io.inputs.set_count(2);
  }
  setup_composer(context) {
    const renderer = context.composer.renderer;
    const parameters = {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBAFormat,
      stencilBuffer: true
    };
    const render_target1 = Poly2.instance().renderers_controller.render_target(renderer.domElement.offsetWidth, renderer.domElement.offsetHeight, parameters);
    const render_target2 = Poly2.instance().renderers_controller.render_target(renderer.domElement.offsetWidth, renderer.domElement.offsetHeight, parameters);
    const composer1 = new EffectComposer2(renderer, render_target1);
    const composer2 = new EffectComposer2(renderer, render_target2);
    composer1.renderToScreen = false;
    composer2.renderToScreen = false;
    const cloned_context1 = {...context};
    const cloned_context2 = {...context};
    cloned_context1.composer = composer1;
    cloned_context2.composer = composer2;
    this._add_pass_from_input(0, cloned_context1);
    this._add_pass_from_input(1, cloned_context2);
    const pass = new LayerPass(composer1, composer2);
    this.update_pass(pass);
    context.composer.addPass(pass);
  }
  update_pass(pass) {
  }
}
