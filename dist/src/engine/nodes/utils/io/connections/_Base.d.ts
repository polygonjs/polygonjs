import { ParamType } from '../../../../poly/ParamType';
export interface BaseConnectionPointData {
    name: string;
    type: string;
}
export declare abstract class BaseConnectionPoint {
    protected _name: string;
    protected _type: string;
    protected _init_value?: any;
    protected _json: BaseConnectionPointData | undefined;
    constructor(_name: string, _type: string, _init_value?: any);
    get init_value(): any;
    get name(): string;
    get type(): string;
    are_types_matched(src_type: string, dest_type: string): boolean;
    abstract get param_type(): ParamType;
    to_json(): BaseConnectionPointData;
    protected _create_json(): BaseConnectionPointData;
}
