/**
 * gets the position where a ray intersects with a sphere
 *
 * @remarks
 *
 *
 */

import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {Vector3} from 'three/src/math/Vector3';
import {BaseRaySphereActorNode} from './_BaseRaySphere';
import {Ray} from 'three/src/math/Ray';
import {Sphere} from 'three/src/math/Sphere';

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
	protected _processRay(ray: Ray, sphere: Sphere) {
		ray.intersectSphere(sphere, this._target);
		return this._target;
	}
}
