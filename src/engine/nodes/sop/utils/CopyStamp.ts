import {BaseCopyStamp} from '../../utils/BaseCopyStamp';
import {CorePoint} from '../../../../core/geometry/Point';

export class CopyStamp extends BaseCopyStamp {
	protected _point: CorePoint | undefined;

	reset() {
		super.reset();
		this.setPoint(undefined);
	}

	setPoint(point?: CorePoint) {
		const oldPoint = this._point;
		this._point = point;
		if (oldPoint != this._point) {
			this.setDirty();
			this.removeDirtyState();
		}
	}

	value(attrib_name?: string) {
		if (this._point) {
			if (attrib_name) {
				return this._point.attribValue(attrib_name);
			} else {
				return this._point.index();
			}
		} else {
			return this._globalIndex;
		}
	}
}
