import { BaseNodeType } from '../_Base';
import { TimeDependentState } from './states/TimeDependent';
import { ErrorState } from './states/Error';
export declare class StatesController {
    protected node: BaseNodeType;
    time_dependent: TimeDependentState;
    error: ErrorState;
    constructor(node: BaseNodeType);
}
