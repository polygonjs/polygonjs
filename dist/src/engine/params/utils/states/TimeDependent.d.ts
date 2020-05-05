import { BaseParamType } from '../../_Base';
export declare class TimeDependentState {
    protected param: BaseParamType;
    constructor(param: BaseParamType);
    get active(): boolean;
}
