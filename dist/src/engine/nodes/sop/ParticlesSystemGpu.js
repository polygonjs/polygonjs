import {TypedSopNode} from "./_Base";
import {GlobalsTextureHandler} from "../gl/code/globals/Texture";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {ParticlesSystemGpuRenderController} from "./utils/ParticlesSystemGPU/RenderController";
import {
  ParticlesSystemGpuComputeController,
  PARTICLE_DATA_TYPES
} from "./utils/ParticlesSystemGPU/GPUComputeController";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {GlNodeFinder} from "../gl/code/utils/NodeFinder";
import {PointsBuilderMatNode} from "../mat/PointsBuilder";
import {ConstantGlNode} from "../gl/Constant";
import {AssemblerName} from "../../poly/registers/assemblers/_BaseRegister";
import {Poly as Poly2} from "../../Poly";
import {ParticlesPersistedConfig} from "../gl/code/assemblers/particles/PersistedConfig";
class ParticlesSystemGpuSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.start_frame = ParamConfig.FLOAT(1, {range: [1, 100]});
    this.auto_textures_size = ParamConfig.BOOLEAN(1);
    this.max_textures_size = ParamConfig.VECTOR2([1024, 1024], {visible_if: {auto_textures_size: 1}});
    this.textures_size = ParamConfig.VECTOR2([64, 64], {visible_if: {auto_textures_size: 0}});
    this.data_type = ParamConfig.INTEGER(0, {
      menu: {
        entries: PARTICLE_DATA_TYPES.map((value, index) => {
          return {value: index, name: value};
        })
      }
    });
    this.reset = ParamConfig.BUTTON(null, {
      callback: (node, param) => {
        ParticlesSystemGpuSopNode.PARAM_CALLBACK_reset(node);
      }
    });
    this.material = ParamConfig.OPERATOR_PATH("", {
      node_selection: {
        context: NodeContext2.MAT
      },
      dependent_on_found_node: false
    });
  }
}
const ParamsConfig2 = new ParticlesSystemGpuSopParamsConfig();
export class ParticlesSystemGpuSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._assembler_controller = this._create_assembler_controller();
    this.persisted_config = new ParticlesPersistedConfig(this);
    this.globals_handler = new GlobalsTextureHandler(GlobalsTextureHandler.PARTICLE_SIM_UV);
    this._shaders_by_name = new Map();
    this.gpu_controller = new ParticlesSystemGpuComputeController(this);
    this.render_controller = new ParticlesSystemGpuRenderController(this);
    this._reset_material_if_dirty_bound = this._reset_material_if_dirty.bind(this);
    this._children_controller_context = NodeContext2.GL;
  }
  static type() {
    return "particles_system_gpu";
  }
  get assembler_controller() {
    return this._assembler_controller;
  }
  used_assembler() {
    return AssemblerName.GL_PARTICLES;
  }
  _create_assembler_controller() {
    return Poly2.instance().assemblersRegister.assembler(this, this.used_assembler());
  }
  shaders_by_name() {
    return this._shaders_by_name;
  }
  static require_webgl2() {
    return true;
  }
  static PARAM_CALLBACK_reset(node) {
    node.PARAM_CALLBACK_reset();
  }
  PARAM_CALLBACK_reset() {
    this.gpu_controller.reset_gpu_compute_and_set_dirty();
  }
  static displayed_input_names() {
    return ["points to emit particles from"];
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.NEVER);
    this.add_post_dirty_hook("_reset_material_if_dirty", this._reset_material_if_dirty_bound);
    this.lifecycle.add_on_create_hook(this._on_create.bind(this));
  }
  _on_create() {
    const current_global = this.nodes_by_type("globals")[0];
    const current_output = this.nodes_by_type("output")[0];
    if (current_global || current_output) {
      return;
    }
    const globals = this.create_node("globals");
    const output = this.create_node("output");
    output.set_input("position", globals, "position");
    globals.ui_data.set_position(-200, 0);
    output.ui_data.set_position(200, 0);
    this._on_create_prepare_material();
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
  async _reset_material_if_dirty() {
    if (this.p.material.is_dirty) {
      this.render_controller.reset_render_material();
      if (!this.is_on_frame_start()) {
        await this.render_controller.init_render_material();
      }
    }
  }
  is_on_frame_start() {
    return this.scene.frame == this.pv.start_frame;
  }
  async cook(input_contents) {
    this.gpu_controller.set_restart_not_required();
    const core_group = input_contents[0];
    this.compile_if_required();
    if (this.is_on_frame_start()) {
      this.gpu_controller.reset_particle_groups();
    }
    if (!this.gpu_controller.initialized) {
      await this.gpu_controller.init(core_group);
    }
    if (!this.render_controller.initialized) {
      this.render_controller.init_core_group(core_group);
      await this.render_controller.init_render_material();
    }
    this.gpu_controller.restart_simulation_if_required();
    this.gpu_controller.compute_similation_if_required();
    if (this.is_on_frame_start()) {
      this.set_core_group(core_group);
    } else {
      this.cook_controller.end_cook();
    }
  }
  async compile_if_required() {
    if (this.assembler_controller?.compile_required()) {
      await this.run_assembler();
    }
  }
  async run_assembler() {
    if (!this.assembler_controller) {
      return;
    }
    const export_nodes = this._find_export_nodes();
    if (export_nodes.length > 0) {
      const root_nodes = export_nodes;
      this.assembler_controller.set_assembler_globals_handler(this.globals_handler);
      this.assembler_controller.assembler.set_root_nodes(root_nodes);
      this.assembler_controller.assembler.compile();
      this.assembler_controller.post_compile();
    }
    const shaders_by_name = this.assembler_controller.assembler.shaders_by_name();
    this._set_shader_names(shaders_by_name);
  }
  _set_shader_names(shaders_by_name) {
    this._shaders_by_name = shaders_by_name;
    this.gpu_controller.set_shaders_by_name(this._shaders_by_name);
    this.render_controller.set_shaders_by_name(this._shaders_by_name);
    this.gpu_controller.reset_gpu_compute();
    this.gpu_controller.reset_particle_groups();
  }
  init_with_persisted_config() {
    const shaders_by_name = this.persisted_config.shaders_by_name();
    const texture_allocations_controller = this.persisted_config.texture_allocations_controller();
    if (shaders_by_name && texture_allocations_controller) {
      this._set_shader_names(shaders_by_name);
      this.gpu_controller.set_persisted_texture_allocation_controller(texture_allocations_controller);
    }
  }
  _find_export_nodes() {
    const nodes = GlNodeFinder.find_attribute_export_nodes(this);
    const output_nodes = GlNodeFinder.find_output_nodes(this);
    if (output_nodes.length > 1) {
      this.states.error.set("only one output node is allowed");
      return [];
    }
    const output_node = output_nodes[0];
    if (output_node) {
      nodes.push(output_node);
    }
    return nodes;
  }
  _on_create_prepare_material() {
    const root = this.scene.root;
    const mat_name = "MAT";
    const particles_mat_name = "points_particles";
    const MAT = root.nodes_by_type("materials")[0] || this.scene.root.create_node("materials");
    MAT.set_name(mat_name);
    const create_points_mat = (MAT2, name) => {
      let points_mat2 = MAT2.node("points_builder1");
      if (!(points_mat2 && points_mat2.type == PointsBuilderMatNode.type())) {
        points_mat2 = MAT2.create_node("points_builder");
      }
      points_mat2.set_name(name);
      let points_mat_constant_point_size = points_mat2.node("constant");
      if (!(points_mat_constant_point_size && points_mat_constant_point_size.type == ConstantGlNode.type())) {
        points_mat_constant_point_size = points_mat2.create_node("constant");
        points_mat_constant_point_size.set_name("constant_point_size");
      }
      points_mat_constant_point_size.p.float.set(4);
      const points_mat_output1 = points_mat2.node("output1");
      if (points_mat_output1) {
        points_mat_output1.set_input("gl_PointSize", points_mat_constant_point_size, ConstantGlNode.OUTPUT_NAME);
      }
      return points_mat2;
    };
    const points_mat = MAT.node(particles_mat_name) || create_points_mat(MAT, particles_mat_name);
    if (points_mat) {
      const new_path = points_mat.full_path();
      if (this.p.material.raw_input != new_path) {
        this.p.material.set(new_path);
      }
    }
  }
}
