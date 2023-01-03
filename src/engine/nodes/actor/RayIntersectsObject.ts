/**
 * returns true if the ray intersects with the input object, false if not
 *
 * @remarks
 *
 *
 */

import {Raycaster} from 'three';
import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {BaseRayObjectActorNode} from './_BaseRayObject';

const OUTPUT_NAME = 'intersects';
export class RayIntersectsObjectActorNode extends BaseRayObjectActorNode<ActorConnectionPointType.BOOLEAN> {
	static override type() {
		return 'rayIntersectsObject';
	}
	protected _expectedOutputName(index: number) {
		return OUTPUT_NAME;
	}
	protected _expectedOutputType(): ActorConnectionPointType.BOOLEAN {
		return ActorConnectionPointType.BOOLEAN;
	}
	private _raycaster = new Raycaster();
	protected _processRayData() {
		if (this._processData.ray && this._processData.Object3D) {
			this._raycaster.ray.copy(this._processData.ray);
			const intersections = this._raycaster.intersectObject(this._processData.Object3D);
			return intersections.length != 0;
		}
		return false;
	}
}
