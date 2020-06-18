import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class SkinSopParamsConfig extends NodeParamsConfig {
}
export declare class SkinSopNode extends TypedSopNode<SkinSopParamsConfig> {
    params_config: SkinSopParamsConfig;
    static type(): string;
    static displayed_input_names(): string[];
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
    process_one_input(input_contents: CoreGroup[]): void;
    process_two_inputs(input_contents: CoreGroup[]): void;
    _get_line_segments(core_group: CoreGroup): import("three").Object3D[];
    _skin(geometry1: BufferGeometry, geometry0: BufferGeometry): BufferGeometry;
}
export {};
