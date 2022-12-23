/**
 * returns the distance between the ray origin and the plane
 *
 * @remarks
 *
 *
 */

import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {BaseRayPlaneActorNode} from './_BaseRayPlane';

const OUTPUT_NAME = 'distance';
export class RayDistanceToPlaneActorNode extends BaseRayPlaneActorNode<ActorConnectionPointType.FLOAT> {
	static override type() {
		return 'rayDistanceToPlane';
	}

	protected _expectedOutputName(index: number) {
		return OUTPUT_NAME;
	}
	protected _expectedOutputType(): ActorConnectionPointType.FLOAT {
		return ActorConnectionPointType.FLOAT;
	}
	protected _processRayData() {
		if (this._processData.ray && this._processData.plane) {
			return this._processData.ray.distanceToPlane(this._processData.plane);
		} else {
			return 0;
		}
	}
}
