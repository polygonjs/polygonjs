import {NodeContext} from '../../../poly/NodeContext';
import {NodeBaseState} from './Base';

export class NodeTimeDependentState<NC extends NodeContext> extends NodeBaseState<NC> {
	active() {
		return this.paramsTimeDependent() || this.inputsTimeDependent();
	}

	paramsTimeDependent(): boolean {
		const param_names = this.node.params.names;
		for (let param_name of param_names) {
			const param = this.node.params.get(param_name);
			if (param && param.states.timeDependent.active()) {
				return true;
			}
		}
		return false;
	}

	inputsTimeDependent(): boolean {
		const inputs = this.node.io.inputs.inputs();
		for (let input of inputs) {
			if (input && input.states.timeDependent.active()) {
				return true;
			}
		}
		return false;
	}

	forceTimeDependent() {
		const predecessor_ids = this.node.graphPredecessors().map((n) => n.graphNodeId());
		const frame_node = this.node.scene().timeController.graphNode;
		if (!predecessor_ids.includes(frame_node.graphNodeId())) {
			this.node.addGraphInput(frame_node, false);
		}
	}
	unforceTimeDependent() {
		const frame_node = this.node.scene().timeController.graphNode;
		this.node.removeGraphInput(frame_node);
	}
}
