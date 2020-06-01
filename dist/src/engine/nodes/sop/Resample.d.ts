import { LineSegments } from 'three/src/objects/LineSegments';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { CatmullRomCurve3 } from 'three/src/extras/curves/CatmullRomCurve3';
import { TypedSopNode } from './_Base';
export declare enum METHOD {
    POINTS_COUNT = "points_count",
    SEGMENT_LENGTH = "segment_length"
}
export declare const METHODS: METHOD[];
export declare enum CURVE_TYPE {
    CENTRIPETAL = "centripetal",
    CHORDAL = "chordal",
    CATMULLROM = "catmullrom"
}
export declare const CURVE_TYPES: CURVE_TYPE[];
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { CoreGroup } from '../../../core/geometry/Group';
import { CorePoint } from '../../../core/geometry/Point';
import { Vector3 } from 'three/src/math/Vector3';
declare class ResampleSopParamsConfig extends NodeParamsConfig {
    method: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    curve_type: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    tension: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    points_count: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    segment_length: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class ResampleSopNode extends TypedSopNode<ResampleSopParamsConfig> {
    params_config: ResampleSopParamsConfig;
    static type(): string;
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
    _resample(line_segment: LineSegments): LineSegments<import("three").Geometry | BufferGeometry, import("three").Material | import("three").Material[]>;
    _create_curve_from_points(points: CorePoint[]): BufferGeometry | undefined;
    _get_points_from_curve(curve: CatmullRomCurve3): Vector3[];
}
export {};
