import {AttribValue} from '../../../types/GlobalTypes';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {PolyScene} from '../../scene/PolyScene';

export class BaseCopyStamp extends CoreGraphNode {
	protected _global_index: number = 0;

	constructor(scene: PolyScene) {
		super(scene, 'CopyStamp');
	}

	set_global_index(index: number) {
		this._global_index = index;
		this.set_dirty();
		this.remove_dirty_state();
	}

	value(attrib_name?: string): AttribValue {
		return this._global_index;
	}
}
