import {BaseParam} from '../_Base';

import {TimeDependentState} from './states/TimeDependent';
import {ErrorState} from './states/Error';

export class StatesController {
	time_dependent = new TimeDependentState(this.param);
	error = new ErrorState(this.param);
	constructor(protected param: BaseParam) {}
}
