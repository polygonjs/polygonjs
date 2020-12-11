import {TypedSopNode} from "./_Base";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class TransformCopySopParamConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.use_second_input = ParamConfig.BOOLEAN(1);
    this.reference = ParamConfig.OPERATOR_PATH("", {
      node_selection: {
        context: NodeContext2.SOP
      },
      visible_if: {use_second_input: 0}
    });
  }
}
const ParamsConfig2 = new TransformCopySopParamConfig();
export class TransformCopySopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "transform_copy";
  }
  static displayed_input_names() {
    return ["objects to transform", "objects to copy transform from"];
  }
  initialize_node() {
    this.io.inputs.set_count(1, 2);
    this.io.inputs.init_inputs_cloned_state([InputCloneMode2.FROM_NODE, InputCloneMode2.NEVER]);
  }
  cook(input_contents) {
    if (this.pv.use_second_input == true && input_contents[1]) {
      this._copy_from_src_objects(input_contents[0].objects(), input_contents[1].objects());
    } else {
      this._copy_from_found_node(input_contents[0].objects());
    }
  }
  _copy_from_src_objects(target_objects, src_objects) {
    let target_object;
    let src_object;
    for (let i = 0; i < target_objects.length; i++) {
      target_object = target_objects[i];
      src_object = src_objects[i];
      src_object.updateMatrix();
      target_object.matrix.copy(src_object.matrix);
      target_object.matrix.decompose(target_object.position, target_object.quaternion, target_object.scale);
    }
    this.set_objects(target_objects);
  }
  async _copy_from_found_node(target_objects) {
    const node = this.p.reference.found_node_with_context(NodeContext2.SOP);
    if (node) {
      const container = await node.request_container();
      const core_group = container.core_content();
      if (core_group) {
        const src_objects = core_group.objects();
        this._copy_from_src_objects(target_objects, src_objects);
        return;
      }
    }
    this.set_objects(target_objects);
  }
}
