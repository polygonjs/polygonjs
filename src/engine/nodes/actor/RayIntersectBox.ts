/**
 * gets the position where a ray intersects with a box3
 *
 * @remarks
 *
 *
 */

import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {Vector3} from 'three';
import {BaseRayBox3ActorNode} from './_BaseRayBox3';

const OUTPUT_NAME = 'position';
export class RayIntersectBoxActorNode extends BaseRayBox3ActorNode<ActorConnectionPointType.VECTOR3> {
	static override type() {
		return 'rayIntersectBox';
	}

	protected _expectedOutputName(index: number) {
		return OUTPUT_NAME;
	}
	protected _expectedOutputType(): ActorConnectionPointType.VECTOR3 {
		return ActorConnectionPointType.VECTOR3;
	}
	private _target = new Vector3();
	protected _processRayData() {
		if (this._processData.box3) {
			this._processData.ray?.intersectBox(this._processData.box3, this._target);
		}
		return this._target;
	}
}
