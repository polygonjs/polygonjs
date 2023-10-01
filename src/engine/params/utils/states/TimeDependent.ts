import {BaseParamType} from '../../_Base';

export class ParamTimeDependentState {
	constructor(protected param: BaseParamType) {}

	active(): boolean {
		const frameGraphNodeId = this.param.scene().timeController.graphNode.graphNodeId();

		return this.param.graphPredecessorIds()?.includes(frameGraphNodeId) || false;
	}
}
