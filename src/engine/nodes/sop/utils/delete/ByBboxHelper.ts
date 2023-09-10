import {DeleteSopNode} from '../../Delete';
import {CorePoint} from '../../../../../core/geometry/entities/point/CorePoint';
import {Box3, Vector3} from 'three';

const _position = new Vector3();
const _bbox = new Box3();

export class ByBboxHelper {
	constructor(private node: DeleteSopNode) {}
	evalForPoints(points: CorePoint[]) {
		this._setBbox(_bbox);

		for (let point of points) {
			point.position(_position);
			const inBbox = _bbox.containsPoint(_position);

			if (inBbox) {
				this.node.entitySelectionHelper.select(point);
			}
		}
	}
	private _setBbox(target: Box3) {
		target.min.copy(this.node.pv.bboxSize).multiplyScalar(-0.5).add(this.node.pv.bboxCenter);
		target.max.copy(this.node.pv.bboxSize).multiplyScalar(0.5).add(this.node.pv.bboxCenter);
	}
}
