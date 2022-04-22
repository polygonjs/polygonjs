/**
 * returns true if the ray intersects with a box3, false if not
 *
 * @remarks
 *
 *
 */

import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {BaseRayBox3ActorNode} from './_BaseRayBox3';
import {Ray} from 'three';
import {Box3} from 'three';

const OUTPUT_NAME = 'intersects';
export class RayIntersectsBoxActorNode extends BaseRayBox3ActorNode<ActorConnectionPointType.BOOLEAN> {
	static override type() {
		return 'rayIntersectsBox';
	}
	protected _expectedOutputName(index: number) {
		return OUTPUT_NAME;
	}
	protected _expectedOutputType(): ActorConnectionPointType.BOOLEAN {
		return ActorConnectionPointType.BOOLEAN;
	}
	protected _processRay(ray: Ray, box3: Box3) {
		return ray.intersectsBox(box3);
	}
}
