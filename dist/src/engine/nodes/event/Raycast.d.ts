import { TypedEventNode } from './_Base';
import { RaycastCPUController } from './utils/raycast/CPUController';
import { RaycastGPUController } from './utils/raycast/GPUController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class RaycastParamsConfig extends NodeParamsConfig {
    mode: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    mouse: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
    override_camera: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    override_ray: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    camera: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    ray_origin: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    ray_direction: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    material: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    pixel_value: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR4>;
    hit_threshold: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    intersect_with: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    plane_direction: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    plane_offset: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    target: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    traverse_children: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    sep: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.SEPARATOR>;
    position: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    geo_attribute: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    geo_attribute_name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    geo_attribute_value: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class RaycastEventNode extends TypedEventNode<RaycastParamsConfig> {
    params_config: RaycastParamsConfig;
    static type(): string;
    readonly cpu_controller: RaycastCPUController;
    readonly gpu_controller: RaycastGPUController;
    initialize_node(): void;
    trigger_hit(): void;
    trigger_miss(): void;
    private _process_mouse_event;
    private _process_trigger_event;
}
export {};
