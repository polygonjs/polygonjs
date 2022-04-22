/**
 * returns true if the ray intersects with a plane, false if not
 *
 * @remarks
 *
 *
 */

import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {BaseRayPlaneActorNode} from './_BaseRayPlane';
import {Ray} from 'three';
import {Plane} from 'three';

const OUTPUT_NAME = 'intersects';
export class RayIntersectsPlaneActorNode extends BaseRayPlaneActorNode<ActorConnectionPointType.BOOLEAN> {
	static override type() {
		return 'rayIntersectsPlane';
	}
	protected _expectedOutputName(index: number) {
		return OUTPUT_NAME;
	}
	protected _expectedOutputType(): ActorConnectionPointType.BOOLEAN {
		return ActorConnectionPointType.BOOLEAN;
	}
	protected _processRay(ray: Ray, plane: Plane) {
		return ray.intersectsPlane(plane);
	}
}
