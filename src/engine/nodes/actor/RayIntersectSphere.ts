/**
 * gets the position where a ray intersects with a sphere
 *
 * @remarks
 *
 *
 */

import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {Vector3} from 'three';
import {BaseRaySphereActorNode} from './_BaseRaySphere';

const OUTPUT_NAME = 'position';
export class RayIntersectSphereActorNode extends BaseRaySphereActorNode<ActorConnectionPointType.VECTOR3> {
	static override type() {
		return 'rayIntersectSphere';
	}

	protected _expectedOutputName(index: number) {
		return OUTPUT_NAME;
	}
	protected _expectedOutputType(): ActorConnectionPointType.VECTOR3 {
		return ActorConnectionPointType.VECTOR3;
	}
	private _target = new Vector3();
	protected _processRayData() {
		if (this._processData.sphere) {
			this._processData.ray?.intersectSphere(this._processData.sphere, this._target) || false;
		}
		return this._target;
	}
}
