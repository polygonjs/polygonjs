import {LineSegments as LineSegments2} from "three/src/objects/LineSegments";
import {Float32BufferAttribute} from "three/src/core/BufferAttribute";
import {BufferGeometry as BufferGeometry2} from "three/src/core/BufferGeometry";
import {CatmullRomCurve3 as CatmullRomCurve32} from "three/src/extras/curves/CatmullRomCurve3";
import {BufferGeometryUtils as BufferGeometryUtils2} from "../../../modules/three/examples/jsm/utils/BufferGeometryUtils";
import lodash_flatten from "lodash/flatten";
import {TypedSopNode} from "./_Base";
import {ObjectType} from "../../../core/geometry/Constant";
import {CoreGeometryUtilCurve} from "../../../core/geometry/util/Curve";
import {CoreGeometry} from "../../../core/geometry/Geometry";
const POSITION_ATTRIBUTE_NAME = "position";
export var METHOD;
(function(METHOD2) {
  METHOD2["POINTS_COUNT"] = "points_count";
  METHOD2["SEGMENT_LENGTH"] = "segment_length";
})(METHOD || (METHOD = {}));
export const METHODS = [METHOD.POINTS_COUNT, METHOD.SEGMENT_LENGTH];
export var CURVE_TYPE;
(function(CURVE_TYPE2) {
  CURVE_TYPE2["CENTRIPETAL"] = "centripetal";
  CURVE_TYPE2["CHORDAL"] = "chordal";
  CURVE_TYPE2["CATMULLROM"] = "catmullrom";
})(CURVE_TYPE || (CURVE_TYPE = {}));
export const CURVE_TYPES = [CURVE_TYPE.CENTRIPETAL, CURVE_TYPE.CHORDAL, CURVE_TYPE.CATMULLROM];
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {TypeAssert} from "../../poly/Assert";
class ResampleSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.method = ParamConfig.INTEGER(METHODS.indexOf(METHOD.POINTS_COUNT), {
      menu: {
        entries: METHODS.map((name, i) => {
          return {
            name,
            value: i
          };
        })
      }
    });
    this.curve_type = ParamConfig.INTEGER(CURVE_TYPES.indexOf(CURVE_TYPE.CATMULLROM), {
      range: [0, 2],
      range_locked: [true, true],
      menu: {
        entries: CURVE_TYPES.map((name, i) => {
          return {
            name,
            value: i
          };
        })
      }
    });
    this.tension = ParamConfig.FLOAT(0.01, {
      range: [0, 1],
      range_locked: [true, true]
    });
    this.points_count = ParamConfig.INTEGER(100, {
      visible_if: {method: METHODS.indexOf(METHOD.POINTS_COUNT)},
      range: [1, 1e3],
      range_locked: [true, false]
    });
    this.segment_length = ParamConfig.FLOAT(1, {
      visible_if: {method: METHODS.indexOf(METHOD.SEGMENT_LENGTH)}
    });
  }
}
const ParamsConfig2 = new ResampleSopParamsConfig();
export class ResampleSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "resample";
  }
  initialize_node() {
    this.io.inputs.set_count(1);
  }
  cook(input_contents) {
    const core_group = input_contents[0];
    const resampled_objects = [];
    if (this.pv.points_count >= 2) {
      const core_objects = core_group.core_objects();
      for (let i = 0; i < core_objects.length; i++) {
        const core_object = core_objects[i];
        const object = core_object.object();
        if (object instanceof LineSegments2) {
          const resampled_object = this._resample(object);
          resampled_objects.push(resampled_object);
        }
      }
    }
    this.set_objects(resampled_objects);
  }
  _resample(line_segment) {
    const geometry = line_segment.geometry;
    const core_geometry = new CoreGeometry(geometry);
    const points = core_geometry.points();
    const indices = geometry.getIndex()?.array;
    const accumulated_curve_point_indices = CoreGeometryUtilCurve.accumulated_curve_point_indices(indices);
    const geometries = [];
    for (let i = 0; i < accumulated_curve_point_indices.length; i++) {
      const curve_point_indices = accumulated_curve_point_indices[i];
      const current_points = curve_point_indices.map((index) => points[index]);
      const geometry2 = this._create_curve_from_points(current_points);
      if (geometry2) {
        geometries.push(geometry2);
      }
    }
    const merged_geometry = BufferGeometryUtils2.mergeBufferGeometries(geometries);
    const object = this.create_object(merged_geometry, ObjectType.LINE_SEGMENTS);
    return object;
  }
  _create_curve_from_points(points) {
    if (points.length <= 1) {
      return;
    }
    const old_curve_positions = points.map((point) => point.attrib_value(POSITION_ATTRIBUTE_NAME));
    const closed = false;
    const curve_type = CURVE_TYPES[this.pv.curve_type];
    const tension = this.pv.tension;
    const curve = new CatmullRomCurve32(old_curve_positions, closed, curve_type, tension);
    const new_curve_points = this._get_points_from_curve(curve);
    let positions = [];
    const indices = [];
    for (let i = 0; i < new_curve_points.length; i++) {
      const point_position = new_curve_points[i];
      const position = point_position.toArray();
      positions.push(position);
      if (i > 0) {
        indices.push(i - 1);
        indices.push(i);
      }
    }
    positions = lodash_flatten(positions);
    const geometry = new BufferGeometry2();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    return geometry;
  }
  _get_points_from_curve(curve) {
    const method = METHODS[this.pv.method];
    switch (method) {
      case METHOD.POINTS_COUNT:
        return curve.getSpacedPoints(Math.max(2, this.pv.points_count));
      case METHOD.SEGMENT_LENGTH:
        var length = curve.getLength();
        var points_count = this.pv.segment_length !== 0 ? 1 + length / this.pv.segment_length : 2;
        points_count = Math.max(2, points_count);
        return curve.getSpacedPoints(points_count);
    }
    TypeAssert.unreachable(method);
  }
}
