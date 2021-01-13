import {BaseParamType} from '../../_Base';

export class TimeDependentState {
	constructor(protected param: BaseParamType) {}

	active(): boolean {
		const frame_graph_node_id = this.param.scene().timeController.graph_node.graphNodeId();

		return this.param.graphPredecessorIds().includes(frame_graph_node_id);
	}
}
