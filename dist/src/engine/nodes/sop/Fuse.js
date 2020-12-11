import {TypedSopNode} from "./_Base";
import {CoreGeometry} from "../../../core/geometry/Geometry";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {object_type_from_constructor} from "../../../core/geometry/Constant";
class FuseSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.dist = ParamConfig.FLOAT(0.1, {
      range: [0, 1],
      range_locked: [true, false]
    });
  }
}
const ParamsConfig2 = new FuseSopParamsConfig();
export class FuseSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "fuse";
  }
  static displayed_input_names() {
    return ["points to fuse together"];
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.FROM_NODE);
  }
  cook(input_contents) {
    const core_group = input_contents[0];
    const new_objects = [];
    let new_object;
    for (let core_object of core_group.core_objects()) {
      new_object = this._fuse_core_object(core_object);
      if (new_object) {
        new_objects.push(new_object);
      }
    }
    this.set_objects(new_objects);
  }
  _fuse_core_object(core_object) {
    const object = core_object.object();
    if (!object) {
      return;
    }
    const points = core_object.points();
    const precision = this.pv.dist;
    const points_by_position = {};
    for (let point of points) {
      const position = point.position();
      const rounded_position = new Vector32(Math.round(position.x / precision), Math.round(position.y / precision), Math.round(position.z / precision));
      const key = rounded_position.toArray().join("-");
      points_by_position[key] = points_by_position[key] || [];
      points_by_position[key].push(point);
    }
    const kept_points = [];
    Object.keys(points_by_position).forEach((key) => {
      kept_points.push(points_by_position[key][0]);
    });
    object.geometry.dispose();
    if (kept_points.length > 0) {
      const geometry = CoreGeometry.geometry_from_points(kept_points, object_type_from_constructor(object.constructor));
      if (geometry) {
        object.geometry = geometry;
      }
      return object;
    } else {
    }
  }
}
