import {BaseParamType} from '../_Base';

import {TimeDependentState} from './states/TimeDependent';
import {ParamErrorState} from './states/Error';

export class StatesController {
	time_dependent = new TimeDependentState(this.param);
	error = new ParamErrorState(this.param);
	constructor(protected param: BaseParamType) {}
}
