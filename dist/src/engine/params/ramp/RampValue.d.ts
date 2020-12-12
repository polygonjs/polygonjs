export interface RampPointJson {
    position: number;
    value: number;
}
export interface RampValueJson {
    points: RampPointJson[];
    interpolation: string;
}
export declare class RampPoint {
    private _position;
    private _value;
    constructor(_position?: number, _value?: number);
    to_json(): RampPointJson;
    get position(): number;
    get value(): number;
    copy(point: RampPoint): void;
    clone(): RampPoint;
    is_equal(other_point: RampPoint): boolean;
    is_equal_json(json: RampPointJson): boolean;
    from_json(json: RampPointJson): void;
    static are_equal_json(json1: RampPointJson, json2: RampPointJson): boolean;
    static from_json(json: RampPointJson): RampPoint;
}
export declare enum RampInterpolation {
    LINEAR = "linear"
}
export declare class RampValue {
    private _interpolation;
    private _points;
    private _uuid;
    constructor(_interpolation?: string, _points?: RampPoint[]);
    get uuid(): string;
    get interpolation(): string;
    get points(): RampPoint[];
    static from_json(json: RampValueJson): RampValue;
    to_json(): RampValueJson;
    clone(): RampValue;
    copy(ramp: RampValue): void;
    is_equal(other_ramp_value: RampValue): boolean;
    is_equal_json(json: RampValueJson): boolean;
    static are_json_equal(json1: RampValueJson, json2: RampValueJson): boolean;
    from_json(json: RampValueJson): void;
}
