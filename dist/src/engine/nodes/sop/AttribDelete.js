import {TypedSopNode} from "./_Base";
import {CoreObject} from "../../../core/geometry/Object";
import {CoreGeometry} from "../../../core/geometry/Geometry";
import {AttribClassMenuEntries, AttribClass} from "../../../core/geometry/Constant";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class AttribDeleteSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.class = ParamConfig.INTEGER(AttribClass.VERTEX, {
      menu: {
        entries: AttribClassMenuEntries
      }
    });
    this.name = ParamConfig.STRING("");
  }
}
const ParamsConfig2 = new AttribDeleteSopParamsConfig();
export class AttribDeleteSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "attrib_delete";
  }
  static displayed_input_names() {
    return ["geometry to delete attributes from"];
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.FROM_NODE);
    this.scene.dispatch_controller.on_add_listener(() => {
      this.params.on_params_created("params_label", () => {
        this.params.label.init([this.p.name]);
      });
    });
  }
  cook(input_contents) {
    const core_group = input_contents[0];
    const attrib_names = core_group.attrib_names_matching_mask(this.pv.name);
    for (let attrib_name of attrib_names) {
      switch (this.pv.class) {
        case AttribClass.VERTEX:
          this.delete_vertex_attribute(core_group, attrib_name);
        case AttribClass.OBJECT:
          this.delete_object_attribute(core_group, attrib_name);
      }
    }
    this.set_core_group(core_group);
  }
  delete_vertex_attribute(core_group, attrib_name) {
    for (let object of core_group.objects()) {
      object.traverse((object3d) => {
        const child = object3d;
        if (child.geometry) {
          const core_geometry = new CoreGeometry(child.geometry);
          core_geometry.delete_attribute(attrib_name);
        }
      });
    }
  }
  delete_object_attribute(core_group, attrib_name) {
    for (let object of core_group.objects()) {
      let index = 0;
      object.traverse((object3d) => {
        const child = object3d;
        const core_object = new CoreObject(child, index);
        core_object.delete_attribute(attrib_name);
        index++;
      });
    }
  }
}
