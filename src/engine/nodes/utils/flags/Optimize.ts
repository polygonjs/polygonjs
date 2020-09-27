import {BaseFlag} from './Base';
import {NodeEvent} from '../../../poly/NodeEvent';

export class OptimizeFlag extends BaseFlag {
	protected _state: boolean = false;
	on_update() {
		this.node.emit(NodeEvent.FLAG_OPTIMIZE_UPDATED);
	}
}
