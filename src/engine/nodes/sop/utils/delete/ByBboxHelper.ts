import {DeleteSopNode} from '../../Delete';
import {CorePoint} from '../../../../../core/geometry/Point';
import {Box3} from 'three/src/math/Box3';
import {Vector3} from 'three/src/math/Vector3';

export class ByBboxHelper {
	private _bbox_cache: Box3 | undefined;
	private _point_position = new Vector3();
	constructor(private node: DeleteSopNode) {}
	eval_for_points(points: CorePoint[]) {
		for (let point of points) {
			const in_bbox = this._bbox.containsPoint(point.position(this._point_position));

			if (in_bbox) {
				this.node.entity_selection_helper.select(point);
			}
		}
	}
	private get _bbox() {
		return this._bbox_cache != null
			? this._bbox_cache
			: (this._bbox_cache = new Box3(
					this.node.pv.bbox_center.clone().sub(this.node.pv.bbox_size.clone().multiplyScalar(0.5)),
					this.node.pv.bbox_center.clone().add(this.node.pv.bbox_size.clone().multiplyScalar(0.5))
			  ));
	}
}
