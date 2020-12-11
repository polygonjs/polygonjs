import {TypedNode} from "../_Base";
import {Material as Material2} from "three/src/materials/Material";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
export class TypedMatNode extends TypedNode {
  constructor() {
    super(...arguments);
    this._cook_main_without_inputs_when_dirty_bound = this._cook_main_without_inputs_when_dirty.bind(this);
  }
  static node_context() {
    return NodeContext2.MAT;
  }
  initialize_base_node() {
    super.initialize_base_node();
    this.name_controller.add_post_set_full_path_hook(this.set_material_name.bind(this));
    this.add_post_dirty_hook("_cook_main_without_inputs_when_dirty", () => {
      setTimeout(this._cook_main_without_inputs_when_dirty_bound, 0);
    });
  }
  async _cook_main_without_inputs_when_dirty() {
    await this.cook_controller.cook_main_without_inputs();
  }
  set_material_name() {
    if (this._material) {
      this._material.name = this.full_path();
    }
  }
  get material() {
    return this._material = this._material || this.create_material();
  }
  set_material(material) {
    this.set_container(material);
  }
}
export class BaseMatNodeClass extends TypedMatNode {
  create_material() {
    return new Material2();
  }
}
