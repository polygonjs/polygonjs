import {BaseFlag} from './Base';

export class DisplayFlag extends BaseFlag {
	on_update() {
		this.node.emit('display_flag_update');
		this.node.set_dirty();
	}
}
