import {WebGLRenderTarget as WebGLRenderTarget2} from "three/src/renderers/WebGLRenderTarget";
import {ShaderMaterial as ShaderMaterial2} from "three/src/materials/ShaderMaterial";
import {Scene as Scene2} from "three/src/scenes/Scene";
import {
  FloatType,
  HalfFloatType,
  NearestFilter,
  ClampToEdgeWrapping,
  RGBAFormat,
  LinearFilter
} from "three/src/constants";
import {PlaneBufferGeometry as PlaneBufferGeometry2} from "three/src/geometries/PlaneBufferGeometry";
import {Mesh as Mesh2} from "three/src/objects/Mesh";
import {Camera as Camera2} from "three/src/cameras/Camera";
import {TypedCopNode} from "./_Base";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {EffectsComposerController as EffectsComposerController2, PostProcessNetworkParamsConfig} from "../post/utils/EffectsComposerController";
import {DisplayNodeController as DisplayNodeController2} from "../utils/DisplayNodeController";
import {Vector2 as Vector22} from "three/src/math/Vector2";
import {DataTextureController as DataTextureController2, DataTextureControllerBufferType} from "./utils/DataTextureController";
const VERTEX_SHADER = `
void main()	{
	gl_Position = vec4( position, 1.0 );
}
`;
const FRAGMENT_SHADER = `
uniform vec2 resolution;
uniform sampler2D map;

void main() {
	vec2 uv = vec2(gl_FragCoord.x / resolution.x, gl_FragCoord.y / resolution.y);
	vec4 map_val = texture2D(map, uv);
	gl_FragColor = vec4(map_val);
}`;
const wrapS = ClampToEdgeWrapping;
const wrapT = ClampToEdgeWrapping;
const minFilter = LinearFilter;
const magFilter = NearestFilter;
const parameters1 = {
  wrapS,
  wrapT,
  minFilter,
  magFilter,
  format: RGBAFormat,
  type: /(iPad|iPhone|iPod)/g.test(navigator.userAgent) ? HalfFloatType : FloatType,
  stencilBuffer: false,
  depthBuffer: false
};
const parameters2 = {
  minFilter: LinearFilter,
  magFilter: LinearFilter,
  format: RGBAFormat,
  stencilBuffer: false
};
const data_type1 = DataTextureControllerBufferType.Float32Array;
const data_type2 = DataTextureControllerBufferType.Uint8Array;
const OPTION_SETS = {
  data1: {
    data_type: data_type1,
    params: parameters1
  },
  data2: {
    data_type: data_type2,
    params: parameters2
  }
};
const OPTION_SET = OPTION_SETS.data2;
import {ParamConfig} from "../utils/params/ParamsConfig";
import {CopRendererController} from "./utils/RendererController";
class PostProcessCopNetworkParamsConfig extends PostProcessNetworkParamsConfig {
  constructor() {
    super(...arguments);
    this.use_camera_renderer = ParamConfig.BOOLEAN(0);
  }
}
const ParamsConfig2 = new PostProcessCopNetworkParamsConfig();
export class PostCopNode extends TypedCopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._texture_mesh = new Mesh2(new PlaneBufferGeometry2(2, 2));
    this._texture_material = new ShaderMaterial2({
      uniforms: {
        map: {value: null},
        resolution: {value: null}
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER
    });
    this._texture_scene = new Scene2();
    this._texture_camera = new Camera2();
    this._composer_resolution = new Vector22();
    this.effects_composer_controller = new EffectsComposerController2(this);
    this.display_node_controller = new DisplayNodeController2(this, this.effects_composer_controller.display_node_controller_callbacks());
    this._children_controller_context = NodeContext2.POST;
  }
  static type() {
    return "post";
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.lifecycle.add_on_create_hook(() => {
      this._create_start_nodes();
    });
    this._texture_mesh.name = "cop/post";
    this._texture_scene.name = "cop/post";
    this._texture_camera.name = "cop/post";
    this._texture_mesh.material = this._texture_material;
    this._texture_scene.add(this._texture_mesh);
    this._texture_camera.position.z = 1;
    this.dirty_controller.add_post_dirty_hook("reset", () => {
      this.reset();
    });
  }
  create_node(type, params_init_value_overrides) {
    return super.create_node(type, params_init_value_overrides);
  }
  createNode(node_class, params_init_value_overrides) {
    return super.createNode(node_class, params_init_value_overrides);
  }
  children() {
    return super.children();
  }
  nodes_by_type(type) {
    return super.nodes_by_type(type);
  }
  async cook(input_contents) {
    const texture = input_contents[0];
    this.build_effects_composer_if_required();
    this.render_on_target(texture);
  }
  build_effects_composer_if_required() {
    if (true) {
      this.build_effects_composer();
    }
  }
  build_effects_composer() {
  }
  async render_on_target(texture) {
    this._renderer_controller = this._renderer_controller || new CopRendererController(this);
    const renderer = await this._renderer_controller.renderer();
    this._renderer_controller.save_state();
    this._composer_resolution.set(texture.image.width, texture.image.height);
    this._render_target = this._render_target || this._create_render_target(this._composer_resolution.x, this._composer_resolution.y);
    renderer.setRenderTarget(this._render_target);
    renderer.setSize(this._composer_resolution.x, this._composer_resolution.y);
    this._composer = this._composer || this._create_composer(renderer, this._render_target);
    this._texture_material.uniforms.map.value = texture;
    this._texture_material.uniforms.resolution.value = this._composer_resolution;
    this._composer.render();
    if (this.pv.use_camera_renderer) {
      this.set_texture(this._render_target.texture);
    } else {
      const data_texture = this._copy_to_data_texture(renderer, this._render_target);
      this.set_texture(data_texture);
    }
    this._renderer_controller.restore_state();
  }
  render_target() {
    return this._render_target;
  }
  _copy_to_data_texture(renderer, render_target) {
    this._data_texture_controller = this._data_texture_controller || new DataTextureController2(OPTION_SET.data_type);
    const data_texture = this._data_texture_controller.from_render_target(renderer, render_target);
    data_texture.needsUpdate = true;
    return data_texture;
  }
  _create_render_target(width, height) {
    if (this._render_target) {
      const image = this._render_target.texture.image;
      if (image.width == width && image.height == height) {
        return this._render_target;
      }
    }
    var renderTarget = new WebGLRenderTarget2(width, height, OPTION_SET.params);
    return renderTarget;
  }
  _create_composer(renderer, render_target) {
    const composer = this.effects_composer_controller.create_effects_composer({
      renderer,
      scene: this._texture_scene,
      camera: this._texture_camera,
      resolution: this._composer_resolution,
      requester: this
    });
    composer.renderToScreen = false;
    return composer;
  }
  reset() {
    this._composer = void 0;
  }
  _create_start_nodes() {
    const null1 = this.create_node("null");
    const unreal_bloom1 = this.create_node("unreal_bloom");
    null1.set_name("OUT");
    null1.set_input(0, unreal_bloom1);
    null1.ui_data.set_position(0, 200);
    unreal_bloom1.ui_data.set_position(0, -200);
    null1.flags.display.set(true);
  }
}
