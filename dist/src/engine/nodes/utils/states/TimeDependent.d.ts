import { BaseState } from './Base';
export declare class TimeDependentState extends BaseState {
    get active(): boolean;
    are_params_time_dependent(): boolean;
    are_inputs_time_dependent(): boolean;
    force_time_dependent(): void;
    unforce_time_dependent(): void;
}
