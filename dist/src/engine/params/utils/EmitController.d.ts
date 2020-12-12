import { BaseParamType } from '../_Base';
import { ParamEvent } from '../../poly/ParamEvent';
export declare class EmitController {
    protected param: BaseParamType;
    _blocked_emit: boolean;
    _blocked_parent_emit: boolean;
    _count_by_event_name: Dictionary<number>;
    constructor(param: BaseParamType);
    get emit_allowed(): boolean;
    block_emit(): boolean;
    unblock_emit(): boolean;
    block_parent_emit(): boolean;
    unblock_parent_emit(): boolean;
    increment_count(event_name: ParamEvent): void;
    events_count(event_name: ParamEvent): number;
    emit(event: ParamEvent): void;
}
