import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class AttribDeleteSopParamsConfig extends NodeParamsConfig {
    class: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
}
export declare class AttribDeleteSopNode extends TypedSopNode<AttribDeleteSopParamsConfig> {
    params_config: AttribDeleteSopParamsConfig;
    static type(): string;
    static displayed_input_names(): string[];
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
    delete_vertex_attribute(core_group: CoreGroup, attrib_name: string): void;
    delete_object_attribute(core_group: CoreGroup, attrib_name: string): void;
}
export {};
