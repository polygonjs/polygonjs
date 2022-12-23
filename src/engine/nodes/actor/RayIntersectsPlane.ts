/**
 * returns true if the ray intersects with a plane, false if not
 *
 * @remarks
 *
 *
 */

import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {BaseRayPlaneActorNode} from './_BaseRayPlane';

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
	protected _processRayData() {
		if (this._processData.plane) {
			return this._processData.ray?.intersectsPlane(this._processData.plane) || false;
		} else {
			return false;
		}
	}
}
