/**
 * gets the position where a ray intersects with a plane
 *
 * @remarks
 *
 *
 */

import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {Vector3} from 'three';
import {BaseRayPlaneActorNode} from './_BaseRayPlane';
import {Ray} from 'three';
import {Plane} from 'three';

const OUTPUT_NAME = 'position';
export class RayIntersectPlaneActorNode extends BaseRayPlaneActorNode<ActorConnectionPointType.VECTOR3> {
	static override type() {
		return 'rayIntersectPlane';
	}

	protected _expectedOutputName(index: number) {
		return OUTPUT_NAME;
	}
	protected _expectedOutputType(): ActorConnectionPointType.VECTOR3 {
		return ActorConnectionPointType.VECTOR3;
	}
	private _target = new Vector3();
	protected _processRay(ray: Ray, plane: Plane) {
		ray.intersectPlane(plane, this._target);
		return this._target;
	}
}
