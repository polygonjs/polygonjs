import { Object3D } from 'three/src/core/Object3D';
import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class AddSopParamsConfig extends NodeParamsConfig {
    create_point: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    points_count: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    position: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    open: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    connect_to_last_point: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class AddSopNode extends TypedSopNode<AddSopParamsConfig> {
    params_config: AddSopParamsConfig;
    static type(): string;
    _objects: Object3D[] | undefined;
    static displayed_input_names(): string[];
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
    private _create_point;
}
export {};
