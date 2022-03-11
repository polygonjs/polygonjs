import {BaseParamType} from '../_Base';

import {ParamTimeDependentState} from './states/TimeDependent';
import {ParamErrorState} from './states/Error';

export class ParamStatesController {
	timeDependent = new ParamTimeDependentState(this.param);
	error = new ParamErrorState(this.param);
	constructor(protected param: BaseParamType) {}
}
