import {Number3} from '../../../../../types/GlobalTypes';
import {RaycastEventNode} from '../../Raycast';
import {Vector3} from 'three/src/math/Vector3';
import {ParamType} from '../../../../poly/ParamType';
import {Vector3Param} from '../../../../params/Vector3';
import {Poly} from '../../../../Poly';
import {isBooleanTrue} from '../../../../../core/BooleanValue';

export enum CPUIntersectWith {
	GEOMETRY = 'geometry',
	PLANE = 'plane',
}
export const CPU_INTERSECT_WITH_OPTIONS: CPUIntersectWith[] = [CPUIntersectWith.GEOMETRY, CPUIntersectWith.PLANE];

export class RaycastCPUVelocityController {
	constructor(private _node: RaycastEventNode) {}

	private _prev_position: Vector3 | undefined;
	private _set_pos_timestamp = performance.now();
	private _found_velocity_target_param: Vector3Param | undefined;
	private _hit_velocity: Vector3 = new Vector3(0, 0, 0);
	private _hit_velocity_array: Number3 = [0, 0, 0];
	process(hit_position: Vector3) {
		if (!isBooleanTrue(this._node.pv.tvelocity)) {
			return;
		}

		if (!this._prev_position) {
			this._prev_position = this._prev_position || new Vector3();
			this._prev_position.copy(hit_position);
			return;
		}

		const now = performance.now();
		const delta = now - this._set_pos_timestamp;
		this._set_pos_timestamp = now;
		// multiply by 1000 since delta is in ms
		this._hit_velocity.copy(hit_position).sub(this._prev_position).divideScalar(delta).multiplyScalar(1000);
		this._hit_velocity.toArray(this._hit_velocity_array);

		if (isBooleanTrue(this._node.pv.tvelocityTarget)) {
			if (Poly.playerMode()) {
				this._found_velocity_target_param =
					this._found_velocity_target_param || this._node.pv.velocityTarget.paramWithType(ParamType.VECTOR3);
			} else {
				// Do not cache the param in the editor, but fetch it directly from the operator_path.
				// The reason is that params are very prone to disappear and be re-generated,
				// Such as spare params created by Gl Builders
				const targetParamVal = this._node.pv.velocityTarget;
				this._found_velocity_target_param = targetParamVal.paramWithType(ParamType.VECTOR3);
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
		this._prev_position = undefined;
	}
}
