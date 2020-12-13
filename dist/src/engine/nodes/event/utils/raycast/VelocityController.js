import {Vector3 as Vector32} from "three/src/math/Vector3";
import {ParamType as ParamType2} from "../../../../poly/ParamType";
import {Poly as Poly2} from "../../../../Poly";
export var CPUIntersectWith;
(function(CPUIntersectWith2) {
  CPUIntersectWith2["GEOMETRY"] = "geometry";
  CPUIntersectWith2["PLANE"] = "plane";
})(CPUIntersectWith || (CPUIntersectWith = {}));
export const CPU_INTERSECT_WITH_OPTIONS = [CPUIntersectWith.GEOMETRY, CPUIntersectWith.PLANE];
export class RaycastCPUVelocityController {
  constructor(_node) {
    this._node = _node;
    this._set_pos_timestamp = performance.now();
    this._hit_velocity = new Vector32(0, 0, 0);
    this._hit_velocity_array = [0, 0, 0];
  }
  process(hit_position) {
    if (!this._node.pv.tvelocity) {
      return;
    }
    if (!this._prev_position) {
      this._prev_position = this._prev_position || new Vector32();
      this._prev_position.copy(hit_position);
      return;
    }
    const now = performance.now();
    const delta = now - this._set_pos_timestamp;
    this._set_pos_timestamp = now;
    this._hit_velocity.copy(hit_position).sub(this._prev_position).divideScalar(delta).multiplyScalar(1e3);
    this._hit_velocity.toArray(this._hit_velocity_array);
    if (this._node.pv.tvelocity_target) {
      if (Poly2.instance().player_mode()) {
        this._found_velocity_target_param = this._found_velocity_target_param || this._node.p.velocity_target.found_param_with_type(ParamType2.VECTOR3);
      } else {
        const target_param = this._node.p.velocity_target;
        this._found_velocity_target_param = target_param.found_param_with_type(ParamType2.VECTOR3);
      }
      if (this._found_velocity_target_param) {
        this._found_velocity_target_param.set(this._hit_velocity_array);
      }
    } else {
      this._node.p.velocity.set(this._hit_velocity_array);
    }
    this._prev_position.copy(hit_position);
  }
  reset() {
    this._prev_position = void 0;
  }
}
