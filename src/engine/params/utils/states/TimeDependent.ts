import {BaseParam} from 'src/engine/params/_Base';

export class TimeDependentState {
	constructor(protected param: BaseParam) {}

	get active() {
		const frame_graph_node_id = this.param
			.scene()
			.context()
			.graph_node_id();

		return this.param.graph_predecessor_ids().contains(frame_graph_node_id);
	}
}
