import {Number3} from '../../../../../types/GlobalTypes';
import {RaycastEventNode} from '../../Raycast';
import {Vector3} from 'three';
import {ParamType} from '../../../../poly/ParamType';
import {Vector3Param} from '../../../../params/Vector3';
// import {Poly} from '../../../../Poly';
import {isBooleanTrue} from '../../../../../core/BooleanValue';

export enum CPUIntersectWith {
	GEOMETRY = 'geometry',
	PLANE = 'plane',
}
export const CPU_INTERSECT_WITH_OPTIONS: CPUIntersectWith[] = [CPUIntersectWith.GEOMETRY, CPUIntersectWith.PLANE];

export class RaycastCPUVelocityController {
	constructor(private _node: RaycastEventNode) {}

	private _prevPosition: Vector3 | undefined;
	// private _set_pos_timestamp = -1;
	private _foundVelocityTargetParam: Vector3Param | undefined;
	private _hitVelocity: Vector3 = new Vector3(0, 0, 0);
	private _hitVelocityArray: Number3 = [0, 0, 0];
	process(hitPosition: Vector3) {
		if (!isBooleanTrue(this._node.pv.tvelocity)) {
			return;
		}

		if (!this._prevPosition) {
			this._prevPosition = this._prevPosition || new Vector3();
			this._prevPosition.copy(hitPosition);
			return;
		}

		// const performance = Poly.performance.performanceManager();
		// const now = performance.now();
		const delta = this._node.scene().timeController.delta(); //now - this._set_pos_timestamp;
		// console.log(delta, this._node.scene().timeController.delta());
		// this._set_pos_timestamp = now;
		// multiply by 1000 since delta is in ms
		this._hitVelocity.copy(hitPosition).sub(this._prevPosition).divideScalar(delta).multiplyScalar(1000);
		this._hitVelocity.toArray(this._hitVelocityArray);

		if (isBooleanTrue(this._node.pv.tvelocityTarget)) {
			if (this._foundVelocityTargetParam == null || isBooleanTrue(this._foundVelocityTargetParam.disposed)) {
				const targetParam = this._node.pv.velocityTarget;
				this._foundVelocityTargetParam = targetParam.paramWithType(ParamType.VECTOR3);
			}

			this._foundVelocityTargetParam?.set(this._hitVelocityArray);
		} else {
			this._node.p.velocity.set(this._hitVelocityArray);
		}

		this._prevPosition.copy(hitPosition);
	}

	reset() {
		this._prevPosition = undefined;
	}
}
