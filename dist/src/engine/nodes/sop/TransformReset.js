import {TypedSopNode} from "./_Base";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {TypeAssert} from "../../poly/Assert";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Matrix4 as Matrix42} from "three/src/math/Matrix4";
var TransformResetMode;
(function(TransformResetMode2) {
  TransformResetMode2["RESET_OBJECT"] = "reset objects transform";
  TransformResetMode2["CENTER_GEO"] = "center geometries";
  TransformResetMode2["PROMOTE_GEO_TO_OBJECT"] = "center geometry and transform object";
})(TransformResetMode || (TransformResetMode = {}));
const TRANSFORM_RESET_MODES = [
  TransformResetMode.RESET_OBJECT,
  TransformResetMode.CENTER_GEO,
  TransformResetMode.PROMOTE_GEO_TO_OBJECT
];
import {ParamConfig, NodeParamsConfig} from "../utils/params/ParamsConfig";
import {CoreTransform} from "../../../core/Transform";
class TransformResetSopParamConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.mode = ParamConfig.INTEGER(TRANSFORM_RESET_MODES.indexOf(TransformResetMode.RESET_OBJECT), {
      menu: {
        entries: TRANSFORM_RESET_MODES.map((target_type, i) => {
          return {name: target_type, value: i};
        })
      }
    });
  }
}
const ParamsConfig2 = new TransformResetSopParamConfig();
export class TransformResetSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._bbox_center = new Vector32();
    this._translate_matrix = new Matrix42();
  }
  static type() {
    return "transform_reset";
  }
  static displayed_input_names() {
    return ["objects to reset transform", "optional reference for center"];
  }
  initialize_node() {
    this.io.inputs.set_count(1, 2);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.FROM_NODE);
  }
  cook(input_contents) {
    const mode = TRANSFORM_RESET_MODES[this.pv.mode];
    this._select_mode(mode, input_contents);
  }
  _select_mode(mode, core_groups) {
    switch (mode) {
      case TransformResetMode.RESET_OBJECT: {
        return this._reset_objects(core_groups);
      }
      case TransformResetMode.CENTER_GEO: {
        return this._center_geos(core_groups, false);
      }
      case TransformResetMode.PROMOTE_GEO_TO_OBJECT: {
        return this._center_geos(core_groups, true);
      }
    }
    TypeAssert.unreachable(mode);
  }
  _reset_objects(core_groups) {
    const core_group = core_groups[0];
    const objects = core_group.objects();
    for (let object of objects) {
      object.matrix.identity();
      CoreTransform.decompose_matrix(object);
    }
    this.set_core_group(core_group);
  }
  _center_geos(core_groups, apply_matrix_to_object) {
    const core_group = core_groups[0];
    const objects = core_group.objects_with_geo();
    let ref_objects = objects;
    const ref_core_group = core_groups[1];
    if (ref_core_group) {
      ref_objects = ref_core_group.objects_with_geo();
    }
    for (let i = 0; i < objects.length; i++) {
      const object = objects[i];
      const ref_object = ref_objects[i] || ref_objects[ref_objects.length - 1];
      const geometry = object.geometry;
      const ref_geometry = ref_object.geometry;
      if (geometry && ref_geometry) {
        ref_geometry.computeBoundingBox();
        const bbox = ref_geometry.boundingBox;
        if (bbox) {
          bbox.getCenter(this._bbox_center);
          ref_object.updateMatrixWorld();
          this._bbox_center.applyMatrix4(ref_object.matrixWorld);
          if (apply_matrix_to_object) {
            this._translate_matrix.identity();
            this._translate_matrix.makeTranslation(this._bbox_center.x, this._bbox_center.y, this._bbox_center.z);
            object.matrix.multiply(this._translate_matrix);
            CoreTransform.decompose_matrix(object);
            object.updateWorldMatrix(false, false);
          }
          this._translate_matrix.identity();
          this._translate_matrix.makeTranslation(-this._bbox_center.x, -this._bbox_center.y, -this._bbox_center.z);
          geometry.applyMatrix4(this._translate_matrix);
        }
      }
    }
    this.set_core_group(core_group);
  }
}
