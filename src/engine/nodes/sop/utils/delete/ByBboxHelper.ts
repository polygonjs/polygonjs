import {DeleteSopNode} from '../../Delete';
import {CorePoint} from '../../../../../core/geometry/Point';
import {Box3} from 'three/src/math/Box3';
import {Vector3} from 'three/src/math/Vector3';

export class ByBboxHelper {
	private _point_position = new Vector3();
	constructor(private node: DeleteSopNode) {}
	evalForPoints(points: CorePoint[]) {
		const bbox = this._createBbox();

		for (let point of points) {
			const in_bbox = bbox.containsPoint(point.getPosition(this._point_position));

			if (in_bbox) {
				this.node.entitySelectionHelper.select(point);
			}
		}
	}
	private _createBbox() {
		return new Box3(
			this.node.pv.bboxCenter.clone().sub(this.node.pv.bboxSize.clone().multiplyScalar(0.5)),
			this.node.pv.bboxCenter.clone().add(this.node.pv.bboxSize.clone().multiplyScalar(0.5))
		);
	}
}
