import {TypedSopNode} from "./_Base";
import {
  CoreTransform,
  ROTATION_ORDERS,
  RotationOrder,
  TransformTargetType,
  TRANSFORM_TARGET_TYPES
} from "../../../core/Transform";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {Vector3 as Vector32} from "three/src/math/Vector3";
const max_transform_count = 6;
const ROT_ORDER_DEFAULT = ROTATION_ORDERS.indexOf(RotationOrder.XYZ);
const ROT_ORDER_MENU_ENTRIES = {
  menu: {
    entries: ROTATION_ORDERS.map((order, v) => {
      return {name: order, value: v};
    })
  }
};
function visible_for_count(count) {
  const list = [];
  for (let i = count + 1; i <= max_transform_count; i++) {
    list.push({
      count: i
    });
  }
  return {visible_if: list};
}
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {TypeAssert} from "../../poly/Assert";
import {CoreAttribute, Attribute as Attribute2} from "../../../core/geometry/Attribute";
class TransformMultiSopParamConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.apply_on = ParamConfig.INTEGER(TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.GEOMETRIES), {
      menu: {
        entries: TRANSFORM_TARGET_TYPES.map((target_type, i) => {
          return {name: target_type, value: i};
        })
      }
    });
    this.count = ParamConfig.INTEGER(2, {
      range: [0, max_transform_count],
      range_locked: [true, true]
    });
    this.sep0 = ParamConfig.SEPARATOR(null, {...visible_for_count(0)});
    this.rotation_order0 = ParamConfig.INTEGER(ROT_ORDER_DEFAULT, {
      ...ROT_ORDER_MENU_ENTRIES,
      ...visible_for_count(0)
    });
    this.r0 = ParamConfig.VECTOR3([0, 0, 0], {...visible_for_count(0)});
    this.sep1 = ParamConfig.SEPARATOR(null, {...visible_for_count(1)});
    this.rotation_order1 = ParamConfig.INTEGER(ROT_ORDER_DEFAULT, {
      ...ROT_ORDER_MENU_ENTRIES,
      ...visible_for_count(1)
    });
    this.r1 = ParamConfig.VECTOR3([0, 0, 0], {...visible_for_count(1)});
    this.sep2 = ParamConfig.SEPARATOR(null, {...visible_for_count(2)});
    this.rotation_order2 = ParamConfig.INTEGER(ROT_ORDER_DEFAULT, {
      ...ROT_ORDER_MENU_ENTRIES,
      ...visible_for_count(2)
    });
    this.r2 = ParamConfig.VECTOR3([0, 0, 0], {...visible_for_count(2)});
    this.sep3 = ParamConfig.SEPARATOR(null, {...visible_for_count(3)});
    this.rotation_order3 = ParamConfig.INTEGER(ROT_ORDER_DEFAULT, {
      ...ROT_ORDER_MENU_ENTRIES,
      ...visible_for_count(3)
    });
    this.r3 = ParamConfig.VECTOR3([0, 0, 0], {...visible_for_count(3)});
    this.sep4 = ParamConfig.SEPARATOR(null, {...visible_for_count(4)});
    this.rotation_order4 = ParamConfig.INTEGER(ROT_ORDER_DEFAULT, {
      ...ROT_ORDER_MENU_ENTRIES,
      ...visible_for_count(4)
    });
    this.r4 = ParamConfig.VECTOR3([0, 0, 0], {...visible_for_count(4)});
    this.sep5 = ParamConfig.SEPARATOR(null, {...visible_for_count(5)});
    this.rotation_order5 = ParamConfig.INTEGER(ROT_ORDER_DEFAULT, {
      ...ROT_ORDER_MENU_ENTRIES,
      ...visible_for_count(5)
    });
    this.r5 = ParamConfig.VECTOR3([0, 0, 0], {...visible_for_count(5)});
  }
}
const ParamsConfig2 = new TransformMultiSopParamConfig();
export class TransformMultiSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._core_transform = new CoreTransform();
    this._t = new Vector32(0, 0, 0);
    this._s = new Vector32(1, 1, 1);
    this._scale = 1;
  }
  static type() {
    return "transform_multi";
  }
  static displayed_input_names() {
    return ["objects to transform", "objects to copy initial transform from"];
  }
  initialize_node() {
    this.io.inputs.set_count(1, 2);
    this.io.inputs.init_inputs_cloned_state([InputCloneMode2.FROM_NODE, InputCloneMode2.NEVER]);
    this.scene.dispatch_controller.on_add_listener(() => {
      this.params.on_params_created("params_label", () => {
        this.params.label.init([this.p.apply_on], () => {
          return TRANSFORM_TARGET_TYPES[this.pv.apply_on];
        });
      });
    });
    this.params.on_params_created("cache param pairs", () => {
      this._rot_and_index_pairs = [
        [this.p.r0, this.p.rotation_order0],
        [this.p.r1, this.p.rotation_order1],
        [this.p.r2, this.p.rotation_order2],
        [this.p.r3, this.p.rotation_order3],
        [this.p.r4, this.p.rotation_order4],
        [this.p.r5, this.p.rotation_order5]
      ];
    });
  }
  cook(input_contents) {
    const objects = input_contents[0].objects_with_geo();
    const src_object = input_contents[1] ? input_contents[1].objects_with_geo()[0] : void 0;
    this._apply_transforms(objects, src_object);
    this.set_objects(objects);
  }
  _apply_transforms(objects, src_object) {
    const mode = TRANSFORM_TARGET_TYPES[this.pv.apply_on];
    switch (mode) {
      case TransformTargetType.GEOMETRIES: {
        return this._apply_matrix_to_geometries(objects, src_object);
      }
      case TransformTargetType.OBJECTS: {
        return this._apply_matrix_to_objects(objects, src_object);
      }
    }
    TypeAssert.unreachable(mode);
  }
  _apply_matrix_to_geometries(objects, src_object) {
    if (!this._rot_and_index_pairs) {
      return;
    }
    if (src_object) {
      const src_geometry = src_object.geometry;
      if (src_geometry) {
        const attributes_to_copy = [Attribute2.POSITION, Attribute2.NORMAL, Attribute2.TANGENT];
        for (let attrib_name of attributes_to_copy) {
          const src = src_geometry.attributes[attrib_name];
          for (let object of objects) {
            const geometry = object.geometry;
            const dest = geometry.attributes[attrib_name];
            if (src && dest) {
              CoreAttribute.copy(src, dest);
            }
          }
        }
      }
    }
    let pair;
    for (let i = 0; i < this.pv.count; i++) {
      pair = this._rot_and_index_pairs[i];
      const matrix = this._matrix(pair[0].value, pair[1].value);
      for (let object of objects) {
        object.geometry.applyMatrix4(matrix);
      }
    }
  }
  _apply_matrix_to_objects(objects, src_object) {
    if (!this._rot_and_index_pairs) {
      return;
    }
    if (src_object) {
      for (let object of objects) {
        object.matrix.copy(src_object.matrix);
        object.matrix.decompose(object.position, object.quaternion, object.scale);
      }
    }
    let pair;
    for (let i = 0; i < this.pv.count; i++) {
      pair = this._rot_and_index_pairs[i];
      const matrix = this._matrix(pair[0].value, pair[1].value);
      for (let object of objects) {
        object.applyMatrix4(matrix);
      }
    }
  }
  _matrix(r, rot_order_index) {
    return this._core_transform.matrix(this._t, r, this._s, this._scale, ROTATION_ORDERS[rot_order_index]);
  }
}
