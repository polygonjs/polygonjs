import {BaseFlag} from './Base';
import {NodeEvent} from '../../../poly/NodeEvent';

export class BypassFlag extends BaseFlag {
	protected override _state: boolean = false;
	protected override _on_update() {
		this.node.emit(NodeEvent.FLAG_BYPASS_UPDATED);
		this.node.setDirty();
	}
}
