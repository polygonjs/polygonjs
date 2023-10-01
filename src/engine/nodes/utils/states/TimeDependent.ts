import {NodeContext} from '../../../poly/NodeContext';
import {NodeBaseState} from './Base';

export class NodeTimeDependentState<NC extends NodeContext> extends NodeBaseState<NC> {
	active() {
		return this.paramsTimeDependent() || this.inputsTimeDependent();
	}

	paramsTimeDependent(): boolean {
		const paramNames = this.node.params.names;
		for (const paramName of paramNames) {
			const param = this.node.params.get(paramName);
			if (param && param.states.timeDependent.active()) {
				return true;
			}
		}
		return false;
	}

	inputsTimeDependent(): boolean {
		const inputs = this.node.io.inputs.inputs();
		for (const input of inputs) {
			if (input && input.states.timeDependent.active()) {
				return true;
			}
		}
		return false;
	}

	forceTimeDependent() {
		const predecessorIds = this.node.graphPredecessorIds();
		const frameNode = this.node.scene().timeController.graphNode;
		if (predecessorIds == null || !predecessorIds.includes(frameNode.graphNodeId())) {
			this.node.addGraphInput(frameNode, false);
		}
	}
	unforceTimeDependent() {
		const frameNode = this.node.scene().timeController.graphNode;
		this.node.removeGraphInput(frameNode);
	}
}
