/**
 * returns true if the ray intersects with a box3, false if not
 *
 * @remarks
 *
 *
 */

import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {BaseRayBox3ActorNode} from './_BaseRayBox3';

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
	protected _processRayData() {
		if (this._processData.box3) {
			return this._processData.ray?.intersectsBox(this._processData.box3) || false;
		} else {
			return false;
		}
	}
}
