import {BaseFlag} from './Base';
import {NodeEvent} from '../../../poly/NodeEvent';

export class DisplayFlag extends BaseFlag {
	protected override _on_update() {
		this.node.emit(NodeEvent.FLAG_DISPLAY_UPDATED);
		// this.node.setDirty();
	}
}
