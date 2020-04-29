export interface BaseConnectionPointData {
    name: string;
    type: string;
}
export declare class BaseConnectionPoint {
    protected _name: string;
    protected _type: string;
    protected _json: BaseConnectionPointData | undefined;
    constructor(_name: string, _type: string);
    get name(): string;
    get type(): string;
    are_types_matched(src_type: string, dest_type: string): boolean;
    to_json(): BaseConnectionPointData;
    protected _create_json(): BaseConnectionPointData;
}
