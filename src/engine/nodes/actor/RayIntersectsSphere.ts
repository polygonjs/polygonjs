/**
 * returns true if the ray intersects with a sphere, false if not
 *
 * @remarks
 *
 *
 */

import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {BaseRaySphereActorNode} from './_BaseRaySphere';
import {Ray} from 'three';
import {Sphere} from 'three';

const OUTPUT_NAME = 'intersects';
export class RayIntersectsSphereActorNode extends BaseRaySphereActorNode<ActorConnectionPointType.BOOLEAN> {
	static override type() {
		return 'rayIntersectsSphere';
	}
	protected _expectedOutputName(index: number) {
		return OUTPUT_NAME;
	}
	protected _expectedOutputType(): ActorConnectionPointType.BOOLEAN {
		return ActorConnectionPointType.BOOLEAN;
	}
	protected _processRay(ray: Ray, sphere: Sphere) {
		return ray.intersectsSphere(sphere);
	}
}
