import {AttribValue} from '../../../types/GlobalTypes';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {PolyScene} from '../../scene/PolyScene';

export class BaseCopyStamp extends CoreGraphNode {
	protected _globalIndex: number = 0;

	constructor(scene: PolyScene) {
		super(scene, 'CopyStamp');
	}

	reset() {
		this.setGlobalIndex(0);
	}

	setGlobalIndex(index: number) {
		const oldIndex = this._globalIndex;
		this._globalIndex = index;
		if (oldIndex != this._globalIndex) {
			this.setDirty();
			this.removeDirtyState();
		}
	}

	value(attribName?: string): AttribValue {
		return this._globalIndex;
	}
}
