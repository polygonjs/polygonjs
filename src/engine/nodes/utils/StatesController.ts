import {BaseNodeType} from '../_Base';

import {TimeDependentState} from './states/TimeDependent';
import {NodeErrorState} from './states/Error';

export class StatesController {
	time_dependent = new TimeDependentState(this.node);
	error = new NodeErrorState(this.node);
	constructor(protected node: BaseNodeType) {}
}
