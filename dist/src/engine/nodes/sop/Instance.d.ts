import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { Mesh } from 'three/src/objects/Mesh';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class InstanceSopParamsConfig extends NodeParamsConfig {
    attributes_to_copy: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    apply_material: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    material: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
}
export declare class InstanceSopNode extends TypedSopNode<InstanceSopParamsConfig> {
    params_config: InstanceSopParamsConfig;
    static type(): string;
    private _globals_handler;
    private _geometry;
    static displayed_input_names(): string[];
    private _on_create_bound;
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): Promise<void>;
    _apply_material(object: Mesh): Promise<void>;
    _create_instance(geometry_to_instance: BufferGeometry, template_core_group: CoreGroup): void;
    private _on_create;
}
export {};
