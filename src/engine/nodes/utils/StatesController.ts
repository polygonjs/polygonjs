import {BaseNodeType} from '../_Base';

import {NodeTimeDependentState} from './states/TimeDependent';
import {NodeErrorState} from './states/Error';
import {NodeContext} from '../../poly/NodeContext';

export class NodeStatesController<NC extends NodeContext> {
	timeDependent = new NodeTimeDependentState(this.node);
	error = new NodeErrorState(this.node);
	constructor(protected node: BaseNodeType) {}
}
