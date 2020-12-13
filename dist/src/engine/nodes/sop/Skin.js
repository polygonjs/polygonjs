import {BufferGeometry as BufferGeometry2} from "three/src/core/BufferGeometry";
import lodash_sortBy from "lodash/sortBy";
import lodash_reverse from "lodash/reverse";
import lodash_compact from "lodash/compact";
import {TypedSopNode} from "./_Base";
import {CoreGeometryUtilCurve} from "../../../core/geometry/util/Curve";
import {CoreGeometryOperationSkin} from "../../../core/geometry/operation/Skin";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
class SkinSopParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new SkinSopParamsConfig();
export class SkinSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "skin";
  }
  static displayed_input_names() {
    return ["lines to create polygons from", "if used, lines from both inputs will be used"];
  }
  initialize_node() {
    this.io.inputs.set_count(1, 2);
  }
  cook(input_contents) {
    switch (lodash_compact(this.io.inputs.inputs()).length) {
      case 1:
        return this.process_one_input(input_contents);
      case 2:
        return this.process_two_inputs(input_contents);
      default:
        return this.states.error.set("inputs count not valid");
    }
  }
  process_one_input(input_contents) {
    const core_group0 = input_contents[0];
    const line_segments0 = this._get_line_segments(core_group0);
    const geometries = [];
    if (line_segments0) {
      const first_line_segment = line_segments0[0];
      if (first_line_segment) {
        const src_geometries = CoreGeometryUtilCurve.line_segment_to_geometries(first_line_segment.geometry);
        src_geometries.forEach((src_geometry, i) => {
          if (i > 0) {
            const prev_src_geometry = src_geometries[i - 1];
            const geometry = this._skin(prev_src_geometry, src_geometry);
            geometries.push(geometry);
          }
        });
      }
    }
    this.set_geometries(geometries);
  }
  process_two_inputs(input_contents) {
    const core_group0 = input_contents[0];
    const core_group1 = input_contents[1];
    const line_segments0 = this._get_line_segments(core_group0);
    const line_segments1 = this._get_line_segments(core_group1);
    const line_segments = lodash_reverse(lodash_sortBy([line_segments0, line_segments1], (array) => array.length));
    const smallest_array = line_segments[0];
    const largest_array = line_segments[1];
    const geometries = [];
    smallest_array.forEach((line_segment, i) => {
      const other_line_segment = largest_array[i];
      if (line_segment != null && other_line_segment != null) {
        const geo = line_segment.geometry;
        const other_geo = other_line_segment.geometry;
        const geometry = this._skin(geo, other_geo);
        geometries.push(geometry);
      }
    });
    this.set_geometries(geometries);
  }
  _get_line_segments(core_group) {
    return core_group.objects().filter((child) => child.isLineSegments);
  }
  _skin(geometry1, geometry0) {
    const geometry = new BufferGeometry2();
    const operation = new CoreGeometryOperationSkin(geometry, geometry1, geometry0);
    operation.process();
    return geometry;
  }
}
