import {TypedSopNode} from "./_Base";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {InstanceSopOperation} from "../../../core/operations/sop/Instance";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
const DEFAULT = InstanceSopOperation.DEFAULT_PARAMS;
class InstanceSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.attributes_to_copy = ParamConfig.STRING(DEFAULT.attributes_to_copy);
    this.apply_material = ParamConfig.BOOLEAN(DEFAULT.apply_material);
    this.material = ParamConfig.NODE_PATH(DEFAULT.material.path(), {
      visible_if: {apply_material: 1},
      node_selection: {
        context: NodeContext2.MAT
      },
      dependent_on_found_node: false
    });
  }
}
const ParamsConfig2 = new InstanceSopParamsConfig();
export class InstanceSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._on_create_bound = this._on_create.bind(this);
  }
  static type() {
    return "instance";
  }
  static displayed_input_names() {
    return ["geometry to be instanciated", "points to instance to"];
  }
  initialize_node() {
    super.initialize_node();
    this.lifecycle.add_on_create_hook(this._on_create_bound);
    this.io.inputs.set_count(2);
    this.io.inputs.init_inputs_cloned_state(InstanceSopOperation.INPUT_CLONED_STATE);
  }
  async cook(input_contents) {
    this._operation = this._operation || new InstanceSopOperation(this.scene, this.states);
    const core_group = await this._operation.cook(input_contents, this.pv);
    this.set_core_group(core_group);
  }
  _on_create() {
    const root = this.scene.root;
    const mat_type = "materials";
    const mesh_lambert_builder_type = "mesh_lambert_builder";
    const mat_name = "MAT";
    const mesh_lambert_mat_name = "mesh_lambert_builder1";
    let MAT;
    const node_with_mat_name = root.node(mat_name);
    if (node_with_mat_name && node_with_mat_name.type == mat_type) {
      MAT = node_with_mat_name;
    } else {
      MAT = root.create_node("materials");
      MAT.set_name(mat_name);
    }
    const create_mesh_lambert = (MAT2, mesh_lambert_mat_name2) => {
      const mat_node = MAT2.create_node(mesh_lambert_builder_type);
      mat_node.set_name(mesh_lambert_mat_name2);
      const instance_transform1 = mat_node.create_node("instance_transform");
      let output1 = mat_node.node("output1");
      if (!output1) {
        output1 = mat_node.create_node("output");
      }
      output1.set_input("position", instance_transform1, "position");
      output1.set_input("normal", instance_transform1, "normal");
      return mat_node;
    };
    const mesh_lambert_mat = MAT.node(mesh_lambert_mat_name) || create_mesh_lambert(MAT, mesh_lambert_mat_name);
    this.p.material.set(mesh_lambert_mat.full_path());
  }
}
