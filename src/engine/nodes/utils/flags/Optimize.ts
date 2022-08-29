import {BaseFlag} from './Base';
import {NodeEvent} from '../../../poly/NodeEvent';

export class OptimizeFlag extends BaseFlag {
	protected override _state: boolean = false;
	protected override _onUpdate() {
		this.node.emit(NodeEvent.FLAG_OPTIMIZE_UPDATED);
	}
}
