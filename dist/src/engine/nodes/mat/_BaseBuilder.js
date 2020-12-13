import {TypedMatNode} from "./_Base";
import {MaterialPersistedConfig} from "../gl/code/assemblers/materials/PersistedConfig";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
export class TypedBuilderMatNode extends TypedMatNode {
  constructor() {
    super(...arguments);
    this._children_controller_context = NodeContext2.GL;
    this.persisted_config = new MaterialPersistedConfig(this);
  }
  create_material() {
    let material;
    if (this.persisted_config) {
      material = this.persisted_config.material();
    }
    if (!material) {
      material = this.assembler_controller?.assembler.create_material();
    }
    return material;
  }
  get assembler_controller() {
    return this._assembler_controller = this._assembler_controller || this._create_assembler_controller();
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
  compile_if_required() {
    if (this.assembler_controller?.compile_required()) {
      this._compile();
    }
  }
  _compile() {
    if (this.material && this.assembler_controller) {
      this.assembler_controller.assembler.compile_material(this.material);
      this.assembler_controller.post_compile();
    }
  }
}
