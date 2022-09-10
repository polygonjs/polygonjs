import {BaseFlag} from './Base';
import {NodeEvent} from '../../../poly/NodeEvent';

export class DisplayFlag extends BaseFlag {
	protected override _onUpdate() {
		this.node.emit(NodeEvent.FLAG_DISPLAY_UPDATED);
		// this.node.setDirty();
	}
}
