import {BaseNodeType} from '../_Base';

import {TimeDependentState} from './states/TimeDependent';
import {NodeErrorState} from './states/Error';
import {NodeContext} from '../../poly/NodeContext';

export class StatesController<NC extends NodeContext> {
	timeDependent = new TimeDependentState(this.node);
	error = new NodeErrorState(this.node);
	constructor(protected node: BaseNodeType) {}
}
