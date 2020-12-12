import { BaseParamType } from '../_Base';
import { TimeDependentState } from './states/TimeDependent';
import { ErrorState } from './states/Error';
export declare class StatesController {
    protected param: BaseParamType;
    time_dependent: TimeDependentState;
    error: ErrorState;
    constructor(param: BaseParamType);
}
