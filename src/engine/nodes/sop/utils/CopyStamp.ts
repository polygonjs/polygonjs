import {BaseCopyStamp} from '../../utils/BaseCopyStamp';
import {BaseCorePoint} from '../../../../core/geometry/entities/point/CorePoint';

export class SopCopyStamp extends BaseCopyStamp {
	protected _point: BaseCorePoint | undefined;

	override reset() {
		super.reset();
		this.setPoint(undefined);
	}

	setPoint(point?: BaseCorePoint) {
		const oldPoint = this._point;
		this._point = point;
		if (oldPoint != this._point) {
			this.setDirty();
			this.removeDirtyState();
		}
	}

	override value(attribName?: string) {
		if (this._point) {
			if (attribName) {
				return this._point.attribValue(attribName);
			} else {
				return this._point.index();
			}
		} else {
			if (attribName == null || attribName == 'i') {
				return this._globalIndex;
			}
		}
	}
}
