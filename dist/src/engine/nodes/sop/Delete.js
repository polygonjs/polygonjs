import {TypedSopNode} from "./_Base";
import {
  AttribClass,
  AttribClassMenuEntries,
  ObjectType,
  ObjectTypeMenuEntries,
  ObjectTypes,
  object_type_from_constructor,
  AttribType,
  AttribTypeMenuEntries,
  ATTRIBUTE_TYPES,
  AttribSize,
  ATTRIBUTE_CLASSES,
  ATTRIBUTE_SIZE_RANGE
} from "../../../core/geometry/Constant";
import {CoreGeometry} from "../../../core/geometry/Geometry";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {EntitySelectionHelper as EntitySelectionHelper2} from "./utils/delete/EntitySelectionHelper";
import {
  ByAttributeHelper as ByAttributeHelper2,
  ComparisonOperatorMenuEntries,
  ComparisonOperator,
  COMPARISON_OPERATORS
} from "./utils/delete/ByAttributeHelper";
import {ByExpressionHelper as ByExpressionHelper2} from "./utils/delete/ByExpressionHelper";
import {ByBboxHelper as ByBboxHelper2} from "./utils/delete/ByBboxHelper";
import {ByObjectTypeHelper as ByObjectTypeHelper2} from "./utils/delete/ByObjectTypeHelper";
class DeleteSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.class = ParamConfig.INTEGER(ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX), {
      menu: {
        entries: AttribClassMenuEntries
      }
    });
    this.invert = ParamConfig.BOOLEAN(0);
    this.by_object_type = ParamConfig.BOOLEAN(0, {
      visible_if: {class: ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT)}
    });
    this.object_type = ParamConfig.INTEGER(ObjectTypes.indexOf(ObjectType.MESH), {
      menu: {
        entries: ObjectTypeMenuEntries
      },
      visible_if: {
        class: ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT),
        by_object_type: true
      }
    });
    this.separator_object_type = ParamConfig.SEPARATOR(null, {
      visible_if: {class: ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT)}
    });
    this.by_expression = ParamConfig.BOOLEAN(0);
    this.expression = ParamConfig.BOOLEAN("@ptnum==0", {
      visible_if: {by_expression: true},
      expression: {for_entities: true}
    });
    this.separator_expression = ParamConfig.SEPARATOR();
    this.by_attrib = ParamConfig.BOOLEAN(0);
    this.attrib_type = ParamConfig.INTEGER(ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), {
      menu: {
        entries: AttribTypeMenuEntries
      },
      visible_if: {by_attrib: 1}
    });
    this.attrib_name = ParamConfig.STRING("", {
      visible_if: {by_attrib: 1}
    });
    this.attrib_size = ParamConfig.INTEGER(1, {
      range: ATTRIBUTE_SIZE_RANGE,
      range_locked: [true, true],
      visible_if: {by_attrib: 1, attrib_type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC)}
    });
    this.attrib_comparison_operator = ParamConfig.INTEGER(COMPARISON_OPERATORS.indexOf(ComparisonOperator.EQUAL), {
      menu: {
        entries: ComparisonOperatorMenuEntries
      },
      visible_if: {
        by_attrib: true,
        attrib_type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC),
        attrib_size: AttribSize.FLOAT
      }
    });
    this.attrib_value1 = ParamConfig.FLOAT(0, {
      visible_if: {by_attrib: 1, attrib_type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), attrib_size: 1}
    });
    this.attrib_value2 = ParamConfig.VECTOR2([0, 0], {
      visible_if: {by_attrib: 1, attrib_type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), attrib_size: 2}
    });
    this.attrib_value3 = ParamConfig.VECTOR3([0, 0, 0], {
      visible_if: {by_attrib: 1, attrib_type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), attrib_size: 3}
    });
    this.attrib_value4 = ParamConfig.VECTOR4([0, 0, 0, 0], {
      visible_if: {by_attrib: 1, attrib_type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), attrib_size: 4}
    });
    this.attrib_string = ParamConfig.STRING("", {
      visible_if: {by_attrib: 1, attrib_type: ATTRIBUTE_TYPES.indexOf(AttribType.STRING)}
    });
    this.separator_attrib = ParamConfig.SEPARATOR();
    this.by_bbox = ParamConfig.BOOLEAN(0, {
      visible_if: {
        class: ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX)
      }
    });
    this.bbox_size = ParamConfig.VECTOR3([1, 1, 1], {
      visible_if: {
        class: ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX),
        by_bbox: true
      }
    });
    this.bbox_center = ParamConfig.VECTOR3([0, 0, 0], {
      visible_if: {
        class: ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX),
        by_bbox: true
      }
    });
    this.separator_bbox = ParamConfig.SEPARATOR(null, {
      visible_if: {
        class: ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX)
      }
    });
    this.keep_points = ParamConfig.BOOLEAN(0, {
      visible_if: {class: ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT)}
    });
  }
}
const ParamsConfig2 = new DeleteSopParamsConfig();
export class DeleteSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._marked_for_deletion_per_object_index = new Map();
    this.entity_selection_helper = new EntitySelectionHelper2(this);
    this.by_bbox_helper = new ByBboxHelper2(this);
    this.by_expression_helper = new ByExpressionHelper2(this);
    this.by_attribute_helper = new ByAttributeHelper2(this);
    this.by_object_type_helper = new ByObjectTypeHelper2(this);
  }
  static type() {
    return "delete";
  }
  static displayed_input_names() {
    return ["geometry to delete from"];
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.FROM_NODE);
  }
  async cook(input_contents) {
    const core_group = input_contents[0];
    switch (this.pv.class) {
      case AttribClass.VERTEX:
        await this._eval_for_points(core_group);
        break;
      case AttribClass.OBJECT:
        await this._eval_for_objects(core_group);
        break;
    }
  }
  set_class(attrib_class) {
    this.p.class.set(attrib_class);
  }
  async _eval_for_objects(core_group) {
    const core_objects = core_group.core_objects();
    this.entity_selection_helper.init(core_objects);
    this._marked_for_deletion_per_object_index = new Map();
    for (let core_object of core_objects) {
      this._marked_for_deletion_per_object_index.set(core_object.index, false);
    }
    if (this.pv.by_expression) {
      await this.by_expression_helper.eval_for_entities(core_objects);
    }
    if (this.pv.by_object_type) {
      this.by_object_type_helper.eval_for_objects(core_objects);
    }
    if (this.pv.by_attrib && this.pv.attrib_name != "") {
      this.by_attribute_helper.eval_for_entities(core_objects);
    }
    const core_objects_to_keep = this.entity_selection_helper.entities_to_keep();
    const objects_to_keep = core_objects_to_keep.map((co) => co.object());
    if (this.pv.keep_points) {
      const core_objects_to_delete = this.entity_selection_helper.entities_to_delete();
      for (let core_object_to_delete of core_objects_to_delete) {
        const point_object = this._point_object(core_object_to_delete);
        if (point_object) {
          objects_to_keep.push(point_object);
        }
      }
    }
    this.set_objects(objects_to_keep);
  }
  async _eval_for_points(core_group) {
    const core_objects = core_group.core_objects();
    let core_object;
    let objects = [];
    for (let i = 0; i < core_objects.length; i++) {
      core_object = core_objects[i];
      let core_geometry = core_object.core_geometry();
      if (core_geometry) {
        const object = core_object.object();
        const points = core_geometry.points_from_geometry();
        this.entity_selection_helper.init(points);
        const init_points_count = points.length;
        if (this.pv.by_expression) {
          await this.by_expression_helper.eval_for_entities(points);
        }
        if (this.pv.by_attrib && this.pv.attrib_name != "") {
          this.by_attribute_helper.eval_for_entities(points);
        }
        if (this.pv.by_bbox) {
          this.by_bbox_helper.eval_for_points(points);
        }
        const kept_points = this.entity_selection_helper.entities_to_keep();
        if (kept_points.length == init_points_count) {
          objects.push(object);
        } else {
          core_geometry.geometry().dispose();
          if (kept_points.length > 0) {
            const new_geo = CoreGeometry.geometry_from_points(kept_points, object_type_from_constructor(object.constructor));
            if (new_geo) {
              object.geometry = new_geo;
              objects.push(object);
            }
          }
        }
      }
    }
    this.set_objects(objects);
  }
  _point_object(core_object) {
    const core_points = core_object.points();
    const geometry = CoreGeometry.geometry_from_points(core_points, ObjectType.POINTS);
    if (geometry)
      return this.create_object(geometry, ObjectType.POINTS);
  }
}
