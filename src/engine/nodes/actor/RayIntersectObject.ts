/**
 * gets the intersection of a ray with an object
 *
 * @remarks
 *
 *
 */

import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {Intersection, Raycaster, Vector3} from 'three';
import {BaseRayObjectActorNode} from './_BaseRayObject';
import {ActorNodeTriggerContext} from './_Base';

const DEFAULT_POS = new Vector3();
function _defaultIntersection(context: ActorNodeTriggerContext): Intersection {
	return {
		distance: -1,
		point: DEFAULT_POS,
		object: context.Object3D,
	};
}
export class RayIntersectObjectActorNode extends BaseRayObjectActorNode<ActorConnectionPointType.INTERSECTION> {
	static override type() {
		return 'rayIntersectObject';
	}

	protected _expectedOutputName(index: number) {
		return ActorConnectionPointType.INTERSECTION;
	}
	protected _expectedOutputType(): ActorConnectionPointType.INTERSECTION {
		return ActorConnectionPointType.INTERSECTION;
	}
	private _raycaster = new Raycaster();
	protected _processRayData(context: ActorNodeTriggerContext) {
		if (this._processData.ray && this._processData.Object3D) {
			this._raycaster.ray.copy(this._processData.ray);
			const intersections = this._raycaster.intersectObject(this._processData.Object3D);
			console.log(intersections);
			const intersection = intersections[0];
			if (intersection) {
				return intersection;
			}
		}
		return _defaultIntersection(context);
	}
}
