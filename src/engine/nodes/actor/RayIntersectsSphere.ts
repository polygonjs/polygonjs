/**
 * returns true if the ray intersects with a sphere, false if not
 *
 * @remarks
 *
 *
 */

import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {BaseRaySphereActorNode} from './_BaseRaySphere';

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
	protected _processRayData() {
		if (this._processData.sphere) {
			return this._processData.ray?.intersectsSphere(this._processData.sphere) || false;
		} else {
			return false;
		}
	}
}
