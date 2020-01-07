import {BaseNode} from '../_Base';

import {TimeDependentState} from './states/TimeDependent';
import {ErrorState} from './states/Error';

export class StatesController {
	time_dependent = new TimeDependentState(this.node);
	error = new ErrorState(this.node);
	constructor(protected node: BaseNode) {}
}
