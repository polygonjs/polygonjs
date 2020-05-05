import { TypedSopNode } from './_Base';
import { LineSegments } from 'three/src/objects/LineSegments';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { CoreGroup } from '../../../core/geometry/Group';
import { CorePoint } from '../../../core/geometry/Point';
declare class PolywireSopParamsConfig extends NodeParamsConfig {
    radius: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    segments_radial: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    closed: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class PolywireSopNode extends TypedSopNode<PolywireSopParamsConfig> {
    params_config: PolywireSopParamsConfig;
    static type(): string;
    static displayed_input_names(): string[];
    private _core_transform;
    initialize_node(): void;
    private _geometries;
    cook(input_contents: CoreGroup[]): void;
    _create_tube(line_segment: LineSegments): void;
    _create_tube_from_points(points: CorePoint[]): void;
    _skin(geometry1: BufferGeometry, geometry0: BufferGeometry): BufferGeometry;
}
export {};
