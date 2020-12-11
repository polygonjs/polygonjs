import {WebGLRenderTarget as WebGLRenderTarget2} from "three/src/renderers/WebGLRenderTarget";
import {ShaderMaterial as ShaderMaterial2} from "three/src/materials/ShaderMaterial";
import {Scene as Scene2} from "three/src/scenes/Scene";
import {
  FloatType,
  HalfFloatType,
  RGBAFormat,
  NearestFilter,
  LinearFilter,
  ClampToEdgeWrapping
} from "three/src/constants";
import {PlaneBufferGeometry as PlaneBufferGeometry2} from "three/src/geometries/PlaneBufferGeometry";
import {Mesh as Mesh2} from "three/src/objects/Mesh";
import {Camera as Camera2} from "three/src/cameras/Camera";
import {TypedCopNode} from "./_Base";
import {GlobalsGeometryHandler} from "../gl/code/globals/Geometry";
import {GlNodeFinder} from "../gl/code/utils/NodeFinder";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
const VERTEX_SHADER = `
void main()	{
	gl_Position = vec4( position, 1.0 );
}
`;
const RESOLUTION_DEFAULT = [256, 256];
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {DataTextureController as DataTextureController2, DataTextureControllerBufferType} from "./utils/DataTextureController";
import {CopRendererController} from "./utils/RendererController";
import {AssemblerName} from "../../poly/registers/assemblers/_BaseRegister";
import {Poly as Poly2} from "../../Poly";
import {TexturePersistedConfig} from "../gl/code/assemblers/textures/PersistedConfig";
class BuilderCopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.resolution = ParamConfig.VECTOR2(RESOLUTION_DEFAULT);
    this.use_camera_renderer = ParamConfig.BOOLEAN(0);
  }
}
const ParamsConfig2 = new BuilderCopParamsConfig();
export class BuilderCopNode extends TypedCopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this.persisted_config = new TexturePersistedConfig(this);
    this._assembler_controller = this._create_assembler_controller();
    this._texture_mesh = new Mesh2(new PlaneBufferGeometry2(2, 2));
    this.texture_material = new ShaderMaterial2({
      uniforms: {},
      vertexShader: VERTEX_SHADER,
      fragmentShader: ""
    });
    this._texture_scene = new Scene2();
    this._texture_camera = new Camera2();
    this._children_controller_context = NodeContext2.GL;
    this._cook_main_without_inputs_when_dirty_bound = this._cook_main_without_inputs_when_dirty.bind(this);
  }
  static type() {
    return "builder";
  }
  used_assembler() {
    return AssemblerName.GL_TEXTURE;
  }
  _create_assembler_controller() {
    const assembler_controller = Poly2.instance().assemblers_register.assembler(this, this.used_assembler());
    if (assembler_controller) {
      const globals_handler = new GlobalsGeometryHandler();
      assembler_controller.set_assembler_globals_handler(globals_handler);
      return assembler_controller;
    }
  }
  get assembler_controller() {
    return this._assembler_controller;
  }
  initialize_node() {
    if (this.assembler_controller) {
      this.lifecycle.add_on_create_hook(this.assembler_controller.on_create.bind(this.assembler_controller));
    }
    this._texture_mesh.material = this.texture_material;
    this._texture_mesh.scale.multiplyScalar(0.25);
    this._texture_scene.add(this._texture_mesh);
    this._texture_camera.position.z = 1;
    this.add_post_dirty_hook("_cook_main_without_inputs_when_dirty", () => {
      setTimeout(this._cook_main_without_inputs_when_dirty_bound, 0);
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
  children_allowed() {
    if (this.assembler_controller) {
      return super.children_allowed();
    }
    this.scene.mark_as_read_only(this);
    return false;
  }
  async _cook_main_without_inputs_when_dirty() {
    await this.cook_controller.cook_main_without_inputs();
  }
  async cook() {
    this.compile_if_required();
    this.render_on_target();
  }
  shaders_by_name() {
    return {
      fragment: this._fragment_shader
    };
  }
  compile_if_required() {
    if (this.assembler_controller?.compile_required()) {
      this.compile();
    }
  }
  compile() {
    if (!this.assembler_controller) {
      return;
    }
    const output_nodes = GlNodeFinder.find_output_nodes(this);
    if (output_nodes.length > 1) {
      this.states.error.set("only one output node allowed");
      return;
    }
    const output_node = output_nodes[0];
    if (output_node) {
      const root_nodes = output_nodes;
      this.assembler_controller.assembler.set_root_nodes(root_nodes);
      this.assembler_controller.assembler.update_fragment_shader();
      const fragment_shader = this.assembler_controller.assembler.fragment_shader();
      const uniforms = this.assembler_controller.assembler.uniforms();
      if (fragment_shader && uniforms) {
        this._fragment_shader = fragment_shader;
        this._uniforms = uniforms;
      }
      BuilderCopNode.handle_dependencies(this, this.assembler_controller.assembler.uniforms_time_dependent());
    }
    if (this._fragment_shader && this._uniforms) {
      this.texture_material.fragmentShader = this._fragment_shader;
      this.texture_material.uniforms = this._uniforms;
      this.texture_material.needsUpdate = true;
      this.texture_material.uniforms.resolution = {
        value: this.pv.resolution
      };
    }
    this.assembler_controller?.post_compile();
  }
  static handle_dependencies(node, time_dependent, uniforms) {
    const scene = node.scene;
    const id = node.graph_node_id;
    const id_s = `${id}`;
    if (time_dependent) {
      node.states.time_dependent.force_time_dependent();
      if (uniforms) {
        scene.uniforms_controller.add_time_dependent_uniform_owner(id_s, uniforms);
      }
    } else {
      node.states.time_dependent.unforce_time_dependent();
      scene.uniforms_controller.remove_time_dependent_uniform_owner(id_s);
    }
  }
  async render_on_target() {
    this.create_render_target_if_required();
    if (!this._render_target) {
      return;
    }
    this._renderer_controller = this._renderer_controller || new CopRendererController(this);
    const renderer = await this._renderer_controller.renderer();
    const prev_target = renderer.getRenderTarget();
    renderer.setRenderTarget(this._render_target);
    renderer.clear();
    renderer.render(this._texture_scene, this._texture_camera);
    renderer.setRenderTarget(prev_target);
    if (this._render_target.texture) {
      if (this.pv.use_camera_renderer) {
        this.set_texture(this._render_target.texture);
      } else {
        this._data_texture_controller = this._data_texture_controller || new DataTextureController2(DataTextureControllerBufferType.Float32Array);
        const data_texture = this._data_texture_controller.from_render_target(renderer, this._render_target);
        this.set_texture(data_texture);
      }
    } else {
      this.cook_controller.end_cook();
    }
  }
  render_target() {
    return this._render_target = this._render_target || this._create_render_target(this.pv.resolution.x, this.pv.resolution.y);
  }
  create_render_target_if_required() {
    if (!this._render_target || !this._render_target_resolution_valid()) {
      this._render_target = this._create_render_target(this.pv.resolution.x, this.pv.resolution.y);
      this._data_texture_controller?.reset();
    }
  }
  _render_target_resolution_valid() {
    if (this._render_target) {
      const image = this._render_target.texture.image;
      if (image.width != this.pv.resolution.x || image.height != this.pv.resolution.y) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
  _create_render_target(width, height) {
    if (this._render_target) {
      const image = this._render_target.texture.image;
      if (image.width == width && image.height == height) {
        return this._render_target;
      }
    }
    const wrapS = ClampToEdgeWrapping;
    const wrapT = ClampToEdgeWrapping;
    const minFilter = LinearFilter;
    const magFilter = NearestFilter;
    var renderTarget = new WebGLRenderTarget2(width, height, {
      wrapS,
      wrapT,
      minFilter,
      magFilter,
      format: RGBAFormat,
      type: /(iPad|iPhone|iPod)/g.test(navigator.userAgent) ? HalfFloatType : FloatType,
      stencilBuffer: false,
      depthBuffer: false
    });
    Poly2.warn("created render target", this.full_path(), width, height);
    return renderTarget;
  }
}
