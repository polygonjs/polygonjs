import {BaseFlag} from './Base';

export class DisplayFlag extends BaseFlag {
	on_update() {
		this.node.emit(NodeEvent.FLAG_DISPLAY_UPDATED);
		this.node.set_dirty();
	}
}
