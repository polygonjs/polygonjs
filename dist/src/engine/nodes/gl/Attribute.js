import lodash_trim from "lodash/trim";
import {TypedGlNode} from "./_Base";
import {GlConnectionPointType} from "../utils/io/connections/Gl";
const ATTRIBUTE_NODE_AVAILABLE_GL_TYPES = [
  GlConnectionPointType.FLOAT,
  GlConnectionPointType.VEC2,
  GlConnectionPointType.VEC3,
  GlConnectionPointType.VEC4
];
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {GlNodeType} from "../../poly/NodeContext";
class AttributeGlParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.name = ParamConfig.STRING("");
    this.type = ParamConfig.INTEGER(0, {
      menu: {
        entries: ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.map((name, i) => {
          return {name, value: i};
        })
      }
    });
    this.texport_when_connected = ParamConfig.BOOLEAN(0, {hidden: true});
    this.export_when_connected = ParamConfig.BOOLEAN(0, {visible_if: {texport_when_connected: 1}});
  }
}
const ParamsConfig2 = new AttributeGlParamsConfig();
const AttributeGlNode2 = class extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._on_create_set_name_if_none_bound = this._on_create_set_name_if_none.bind(this);
  }
  static type() {
    return GlNodeType.ATTRIBUTE;
  }
  initialize_node() {
    this.add_post_dirty_hook("_set_mat_to_recompile", this._set_mat_to_recompile_if_is_exporting.bind(this));
    this.lifecycle.add_on_create_hook(this._on_create_set_name_if_none_bound);
    this.io.connection_points.initialize_node();
    this.io.connection_points.set_expected_input_types_function(() => {
      if (this.material_node?.assembler_controller?.allow_attribute_exports()) {
        return [ATTRIBUTE_NODE_AVAILABLE_GL_TYPES[this.pv.type]];
      } else {
        return [];
      }
    });
    this.io.connection_points.set_input_name_function((index) => {
      return AttributeGlNode2.INPUT_NAME;
    });
    this.io.connection_points.set_expected_output_types_function(() => [
      ATTRIBUTE_NODE_AVAILABLE_GL_TYPES[this.pv.type]
    ]);
    this.scene.dispatch_controller.on_add_listener(() => {
      this.params.on_params_created("params_label", () => {
        this.params.label.init([this.p.name, this.p.export_when_connected], () => {
          return this.pv.export_when_connected ? `${this.pv.name} (EXPORTED)` : this.pv.name;
        });
      });
    });
    this.params.add_on_scene_load_hook("prepare params", () => {
      if (this.material_node?.assembler_controller?.allow_attribute_exports()) {
        this.p.texport_when_connected.set(1);
      }
    });
  }
  get input_name() {
    return AttributeGlNode2.INPUT_NAME;
  }
  get output_name() {
    return AttributeGlNode2.OUTPUT_NAME;
  }
  set_lines(shaders_collection_controller) {
    this.material_node?.assembler_controller?.assembler.set_node_lines_attribute(this, shaders_collection_controller);
  }
  get attribute_name() {
    return lodash_trim(this.pv.name);
  }
  gl_type() {
    return this.io.outputs.named_output_connection_points[0].type;
  }
  set_gl_type(type) {
    this.p.type.set(ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.indexOf(type));
  }
  connected_input_node() {
    return this.io.inputs.named_input(AttributeGlNode2.INPUT_NAME);
  }
  connected_input_connection_point() {
    return this.io.inputs.named_input_connection_point(AttributeGlNode2.INPUT_NAME);
  }
  output_connection_point() {
    return this.io.outputs.named_output_connection_points_by_name(this.output_name);
  }
  get is_importing() {
    return this.io.outputs.used_output_names().length > 0;
  }
  get is_exporting() {
    if (this.pv.export_when_connected) {
      const input_node = this.io.inputs.named_input(AttributeGlNode2.INPUT_NAME);
      return input_node != null;
    } else {
      return false;
    }
  }
  _set_mat_to_recompile_if_is_exporting() {
    if (this.is_exporting) {
      this._set_mat_to_recompile();
    }
  }
  _on_create_set_name_if_none() {
    if (this.pv.name == "") {
      this.p.name.set(this.name);
    }
  }
};
export let AttributeGlNode = AttributeGlNode2;
AttributeGlNode.INPUT_NAME = "in";
AttributeGlNode.OUTPUT_NAME = "val";
