import {BaseCopyStamp} from '../../utils/CopyStamp';
import {CorePoint} from '../../../../core/geometry/Point';

export class CopyStamp extends BaseCopyStamp {
	protected _point: CorePoint | undefined;

	set_point(point: CorePoint) {
		this._point = point;
		this.set_dirty();
		this.remove_dirty_state();
	}

	value(attrib_name?: string) {
		if (this._point) {
			if (attrib_name) {
				return this._point.attrib_value(attrib_name);
			} else {
				return this._point.index;
			}
		} else {
			return this._global_index;
		}
	}
}
