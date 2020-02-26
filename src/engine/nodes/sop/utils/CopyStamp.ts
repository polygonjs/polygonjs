import {CorePoint} from '../../../../core/geometry/Point';
import {CoreGraphNode} from '../../../../core/graph/CoreGraphNode';
import {PolyScene} from '../../../scene/PolyScene';

export class CopyStamp extends CoreGraphNode {
	private _global_index: number = 0;
	private _point: CorePoint | undefined;

	constructor(scene: PolyScene) {
		super(scene, 'CopyStamp');
	}

	set_point(point: CorePoint) {
		this._point = point;
		this.set_dirty();
		this.remove_dirty_state();
	}
	set_global_index(index: number) {
		this._global_index = index;
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
