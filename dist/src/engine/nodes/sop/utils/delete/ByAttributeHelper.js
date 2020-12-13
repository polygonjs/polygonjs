import {ATTRIBUTE_TYPES, AttribType, AttribSize, ATTRIBUTE_SIZES} from "../../../../../core/geometry/Constant";
import {TypeAssert} from "../../../../poly/Assert";
import {Vector2 as Vector22} from "three/src/math/Vector2";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Vector4 as Vector42} from "three/src/math/Vector4";
export var ComparisonOperator;
(function(ComparisonOperator2) {
  ComparisonOperator2["EQUAL"] = "==";
  ComparisonOperator2["LESS_THAN"] = "<";
  ComparisonOperator2["EQUAL_OR_LESS_THAN"] = "<=";
  ComparisonOperator2["EQUAL_OR_GREATER_THAN"] = ">=";
  ComparisonOperator2["GREATER_THAN"] = ">";
  ComparisonOperator2["DIFFERENT"] = "!=";
})(ComparisonOperator || (ComparisonOperator = {}));
export const COMPARISON_OPERATORS = [
  ComparisonOperator.EQUAL,
  ComparisonOperator.LESS_THAN,
  ComparisonOperator.EQUAL_OR_LESS_THAN,
  ComparisonOperator.EQUAL_OR_GREATER_THAN,
  ComparisonOperator.GREATER_THAN,
  ComparisonOperator.DIFFERENT
];
const COMPARE_METHOD_FLOAT = {
  [ComparisonOperator.EQUAL]: (n1, n2) => {
    return n1 == n2;
  },
  [ComparisonOperator.LESS_THAN]: (n1, n2) => {
    return n1 < n2;
  },
  [ComparisonOperator.EQUAL_OR_LESS_THAN]: (n1, n2) => {
    return n1 <= n2;
  },
  [ComparisonOperator.EQUAL_OR_GREATER_THAN]: (n1, n2) => {
    return n1 >= n2;
  },
  [ComparisonOperator.GREATER_THAN]: (n1, n2) => {
    return n1 > n2;
  },
  [ComparisonOperator.DIFFERENT]: (n1, n2) => {
    return n1 != n2;
  }
};
export const ComparisonOperatorMenuEntries = COMPARISON_OPERATORS.map((name, value) => {
  return {name, value};
});
export class ByAttributeHelper {
  constructor(node) {
    this.node = node;
  }
  eval_for_entities(entities) {
    const attrib_type = ATTRIBUTE_TYPES[this.node.pv.attrib_type];
    switch (attrib_type) {
      case AttribType.NUMERIC: {
        this._eval_for_numeric(entities);
        return;
      }
      case AttribType.STRING: {
        this._eval_for_string(entities);
        return;
      }
    }
    TypeAssert.unreachable(attrib_type);
  }
  _eval_for_string(entities) {
    let value;
    for (let entity of entities) {
      value = entity.string_attrib_value(this.node.pv.attrib_name);
      if (value == this.node.pv.attrib_string) {
        this.node.entity_selection_helper.select(entity);
      }
    }
  }
  _eval_for_numeric(entities) {
    const attrib_size = ATTRIBUTE_SIZES[this.node.pv.attrib_size - 1];
    switch (attrib_size) {
      case AttribSize.FLOAT: {
        return this._eval_for_points_numeric_float(entities);
      }
      case AttribSize.VECTOR2: {
        return this._eval_for_points_numeric_vector2(entities);
      }
      case AttribSize.VECTOR3: {
        return this._eval_for_points_numeric_vector3(entities);
      }
      case AttribSize.VECTOR4: {
        return this._eval_for_points_numeric_vector4(entities);
      }
    }
    TypeAssert.unreachable(attrib_size);
  }
  _eval_for_points_numeric_float(entities) {
    let attrib_name = this.node.pv.attrib_name;
    const compared_value = this.node.pv.attrib_value1;
    let value;
    const comparison_operator = COMPARISON_OPERATORS[this.node.pv.attrib_comparison_operator];
    const compare_method = COMPARE_METHOD_FLOAT[comparison_operator];
    for (let entity of entities) {
      value = entity.attrib_value(attrib_name);
      if (compare_method(value, compared_value)) {
        this.node.entity_selection_helper.select(entity);
      }
    }
  }
  _eval_for_points_numeric_vector2(entities) {
    let attrib_name = this.node.pv.attrib_name;
    const compared_value = this.node.pv.attrib_value2;
    let target = new Vector22();
    for (let entity of entities) {
      const value = entity.attrib_value(attrib_name, target);
      if (compared_value.equals(value)) {
        this.node.entity_selection_helper.select(entity);
      }
    }
  }
  _eval_for_points_numeric_vector3(entities) {
    let attrib_name = this.node.pv.attrib_name;
    const compared_value = this.node.pv.attrib_value3;
    let target = new Vector32();
    for (let entity of entities) {
      const value = entity.attrib_value(attrib_name, target);
      if (compared_value.equals(value)) {
        this.node.entity_selection_helper.select(entity);
      }
    }
  }
  _eval_for_points_numeric_vector4(entities) {
    let attrib_name = this.node.pv.attrib_name;
    const compared_value = this.node.pv.attrib_value4;
    let target = new Vector42();
    for (let entity of entities) {
      const value = entity.attrib_value(attrib_name, target);
      if (compared_value.equals(value)) {
        this.node.entity_selection_helper.select(entity);
      }
    }
  }
}
