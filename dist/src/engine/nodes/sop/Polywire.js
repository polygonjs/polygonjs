import {TypedSopNode} from "./_Base";
import {CoreGeometry} from "../../../core/geometry/Geometry";
import {CoreTransform, DEFAULT_ROTATION_ORDER} from "../../../core/Transform";
import {CoreGeometryUtilCircle} from "../../../core/geometry/util/Circle";
import {CoreGeometryUtilCurve} from "../../../core/geometry/util/Curve";
import {CoreGeometryOperationSkin} from "../../../core/geometry/operation/Skin";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {LineSegments as LineSegments2} from "three/src/objects/LineSegments";
import {BufferGeometry as BufferGeometry2} from "three/src/core/BufferGeometry";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
const POSITION_ATTRIBUTE_NAME = "position";
const DEFAULT_R = new Vector32(0, 0, 0);
const DEFAULT_S = new Vector32(1, 1, 1);
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {ObjectType} from "../../../core/geometry/Constant";
class PolywireSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.radius = ParamConfig.FLOAT(1);
    this.segments_radial = ParamConfig.INTEGER(8, {
      range: [3, 20],
      range_locked: [true, false]
    });
    this.closed = ParamConfig.BOOLEAN(0);
  }
}
const ParamsConfig2 = new PolywireSopParamsConfig();
export class PolywireSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._core_transform = new CoreTransform();
    this._geometries = [];
  }
  static type() {
    return "polywire";
  }
  static displayed_input_names() {
    return ["lines to create tubes from"];
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.NEVER);
  }
  cook(input_contents) {
    const core_group = input_contents[0];
    this._geometries = [];
    for (let object of core_group.objects()) {
      if (object instanceof LineSegments2) {
        this._create_tube(object);
      }
    }
    const merged_geometry = CoreGeometry.merge_geometries(this._geometries);
    for (let geometry of this._geometries) {
      geometry.dispose();
    }
    if (merged_geometry) {
      const object = this.create_object(merged_geometry, ObjectType.MESH);
      this.set_object(object);
    } else {
      this.set_objects([]);
    }
  }
  _create_tube(line_segment) {
    const geometry = line_segment.geometry;
    const wrapper = new CoreGeometry(geometry);
    const points = wrapper.points();
    const indices = geometry.getIndex()?.array;
    const accumulated_curve_point_indices = CoreGeometryUtilCurve.accumulated_curve_point_indices(indices);
    for (let curve_point_indices of accumulated_curve_point_indices) {
      const current_points = curve_point_indices.map((index) => points[index]);
      this._create_tube_from_points(current_points);
    }
  }
  _create_tube_from_points(points) {
    if (points.length <= 1) {
      return;
    }
    const positions = points.map((point) => point.attrib_value(POSITION_ATTRIBUTE_NAME));
    const circle_template = CoreGeometryUtilCircle.create(this.pv.radius, this.pv.segments_radial);
    const circles = [];
    const scale = 1;
    for (let position of positions) {
      const t = position;
      const matrix = this._core_transform.matrix(t, DEFAULT_R, DEFAULT_S, scale, DEFAULT_ROTATION_ORDER);
      const new_circle = circle_template.clone();
      new_circle.applyMatrix4(matrix);
      circles.push(new_circle);
    }
    for (let i = 0; i < circles.length; i++) {
      if (i > 0) {
        const circle = circles[i];
        const prev_circle = circles[i - 1];
        const geometry = this._skin(prev_circle, circle);
        this._geometries.push(geometry);
      }
    }
  }
  _skin(geometry1, geometry0) {
    const geometry = new BufferGeometry2();
    const operation = new CoreGeometryOperationSkin(geometry, geometry1, geometry0);
    operation.process();
    return geometry;
  }
}
