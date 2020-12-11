import {TypedObjNode} from "../_Base";
import {Matrix4 as Matrix42} from "three/src/math/Matrix4";
import {CoreTransform, ROTATION_ORDERS, RotationOrder} from "../../../../core/Transform";
import {NodeParamsConfig, ParamConfig} from "../../utils/params/ParamsConfig";
export function TransformedParamConfig(Base2, default_params) {
  const matrix_auto_update = default_params?.matrix_auto_update || false;
  return class Mixin extends Base2 {
    constructor() {
      super(...arguments);
      this.transform = ParamConfig.FOLDER();
      this.keep_pos_when_parenting = ParamConfig.BOOLEAN(0);
      this.rotation_order = ParamConfig.INTEGER(ROTATION_ORDERS.indexOf(RotationOrder.XYZ), {
        menu: {
          entries: ROTATION_ORDERS.map((order, v) => {
            return {name: order, value: v};
          })
        }
      });
      this.t = ParamConfig.VECTOR3([0, 0, 0]);
      this.r = ParamConfig.VECTOR3([0, 0, 0]);
      this.s = ParamConfig.VECTOR3([1, 1, 1]);
      this.scale = ParamConfig.FLOAT(1);
      this.matrix_auto_update = ParamConfig.BOOLEAN(matrix_auto_update ? 1 : 0);
      this.tlook_at = ParamConfig.BOOLEAN(0);
      this.look_at_pos = ParamConfig.VECTOR3([0, 0, 0], {
        visible_if: {tlook_at: 1}
      });
      this.up = ParamConfig.VECTOR3([0, 1, 0], {
        visible_if: {tlook_at: 1}
      });
    }
  };
}
class TransformedParamsConfig extends TransformedParamConfig(NodeParamsConfig) {
}
export class TransformedObjNode extends TypedObjNode {
  constructor() {
    super(...arguments);
    this.transform_controller = new TransformController(this);
  }
}
const HOOK_NAME = "_cook_main_without_inputs_when_dirty";
export class TransformController {
  constructor(node) {
    this.node = node;
    this._cook_main_without_inputs_when_dirty_bound = this._cook_main_without_inputs_when_dirty.bind(this);
    this._core_transform = new CoreTransform();
    this._keep_pos_when_parenting_m_object = new Matrix42();
    this._keep_pos_when_parenting_m_new_parent_inv = new Matrix42();
  }
  initialize_node() {
    if (!this.node.dirty_controller.has_hook(HOOK_NAME)) {
      this.node.dirty_controller.add_post_dirty_hook(HOOK_NAME, this._cook_main_without_inputs_when_dirty_bound);
    }
  }
  async _cook_main_without_inputs_when_dirty() {
    await this.node.cook_controller.cook_main_without_inputs();
  }
  update() {
    this.update_transform_with_matrix();
    const object = this.node.object;
    object.matrixAutoUpdate = this.node.pv.matrix_auto_update;
  }
  update_transform_with_matrix(matrix) {
    const object = this.node.object;
    if (matrix != null && !matrix.equals(object.matrix)) {
      object.matrix.copy(matrix);
      object.dispatchEvent({type: "change"});
    } else {
      this._update_matrix_from_params_with_core_transform();
    }
  }
  _update_matrix_from_params_with_core_transform() {
    const object = this.node.object;
    let prev_auto_update = object.matrixAutoUpdate;
    if (prev_auto_update) {
      object.matrixAutoUpdate = false;
    }
    const matrix = this._core_transform.matrix(this.node.pv.t, this.node.pv.r, this.node.pv.s, this.node.pv.scale, ROTATION_ORDERS[this.node.pv.rotation_order]);
    object.matrix.identity();
    object.applyMatrix4(matrix);
    this._apply_look_at();
    object.updateMatrix();
    if (prev_auto_update) {
      object.matrixAutoUpdate = true;
    }
    object.dispatchEvent({type: "change"});
  }
  _apply_look_at() {
    const pv = this.node.pv;
    if (!pv.tlook_at) {
      return;
    }
    this.node.object.up.copy(pv.up);
    this.node.object.lookAt(pv.look_at_pos);
  }
  set_params_from_matrix(matrix, options = {}) {
    CoreTransform.set_params_from_matrix(matrix, this.node, options);
  }
  static update_node_transform_params_if_required(node, new_parent_object) {
    node.transform_controller.update_node_transform_params_if_required(new_parent_object);
  }
  update_node_transform_params_if_required(new_parent_object) {
    if (!this.node.pv.keep_pos_when_parenting) {
      return;
    }
    if (!this.node.scene.loading_controller.loaded) {
      return;
    }
    if (new_parent_object == this.node.object.parent) {
      return;
    }
    const object = this.node.object;
    object.updateMatrixWorld(true);
    new_parent_object.updateMatrixWorld(true);
    this._keep_pos_when_parenting_m_object.copy(object.matrixWorld);
    this._keep_pos_when_parenting_m_new_parent_inv.copy(new_parent_object.matrixWorld);
    this._keep_pos_when_parenting_m_new_parent_inv.invert();
    this._keep_pos_when_parenting_m_object.premultiply(this._keep_pos_when_parenting_m_new_parent_inv);
    CoreTransform.set_params_from_matrix(this._keep_pos_when_parenting_m_object, this.node, {scale: true});
  }
  update_node_transform_params_from_object(update_matrix = false) {
    const object = this.node.object;
    if (update_matrix) {
      object.updateMatrixWorld(true);
    }
    CoreTransform.set_params_from_matrix(object.matrixWorld, this.node, {scale: true});
  }
}
