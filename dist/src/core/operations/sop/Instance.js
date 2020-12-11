import {BaseSopOperation} from "./_Base";
import {TypedPathParamValue} from "../../Walker";
import {GlobalsGeometryHandler} from "../../../engine/nodes/gl/code/globals/Geometry";
import {ObjectTypeByObject} from "../../geometry/Constant";
import {CoreMaterial} from "../../geometry/Material";
import {NodeContext as NodeContext2} from "../../../engine/poly/NodeContext";
import {CoreInstancer} from "../../geometry/Instancer";
import {InputCloneMode as InputCloneMode2} from "../../../engine/poly/InputCloneMode";
export class InstanceSopOperation extends BaseSopOperation {
  static type() {
    return "instance";
  }
  async cook(input_contents, params) {
    const core_group_to_instance = input_contents[0];
    this._geometry = void 0;
    const object_to_instance = core_group_to_instance.objects_with_geo()[0];
    if (object_to_instance) {
      const geometry_to_instance = object_to_instance.geometry;
      if (geometry_to_instance) {
        const core_group = input_contents[1];
        this._create_instance(geometry_to_instance, core_group, params);
      }
    }
    if (this._geometry) {
      const type = ObjectTypeByObject(object_to_instance);
      if (type) {
        const object = this.create_object(this._geometry, type);
        if (params.apply_material) {
          const material = await this._get_material(params);
          if (material) {
            await this._apply_material(object, material);
          }
        }
        return this.create_core_group_from_objects([object]);
      }
    }
    return this.create_core_group_from_objects([]);
  }
  async _get_material(params) {
    if (params.apply_material) {
      const material_node = params.material.ensure_node_context(NodeContext2.MAT, this.states?.error);
      if (material_node) {
        this._globals_handler = this._globals_handler || new GlobalsGeometryHandler();
        const mat_builder_node = material_node;
        if (mat_builder_node.assembler_controller) {
          mat_builder_node.assembler_controller.set_assembler_globals_handler(this._globals_handler);
        }
        const container = await material_node.request_container();
        const material = container.material();
        return material;
      }
    }
  }
  async _apply_material(object, material) {
    object.material = material;
    CoreMaterial.apply_custom_materials(object, material);
  }
  _create_instance(geometry_to_instance, template_core_group, params) {
    this._geometry = CoreInstancer.create_instance_buffer_geo(geometry_to_instance, template_core_group, params.attributes_to_copy);
  }
}
InstanceSopOperation.DEFAULT_PARAMS = {
  attributes_to_copy: "instance*",
  apply_material: true,
  material: new TypedPathParamValue("")
};
InstanceSopOperation.INPUT_CLONED_STATE = [InputCloneMode2.ALWAYS, InputCloneMode2.NEVER];
