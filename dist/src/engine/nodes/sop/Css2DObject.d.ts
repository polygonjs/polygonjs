import { TypedSopNode } from './_Base';
import { CSS2DObject } from '../../../../modules/three/examples/jsm/renderers/CSS2DRenderer';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class Css2DObjectSopParamsConfig extends NodeParamsConfig {
    class_name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    text: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
}
export declare class Css2DObjectSopNode extends TypedSopNode<Css2DObjectSopParamsConfig> {
    params_config: Css2DObjectSopParamsConfig;
    static type(): string;
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
    private _create_objects_from_input_points;
    private _create_object_from_scratch;
    private static create_css_object;
    private static _assign_clone_method;
    static clone_css_object(css_object: CSS2DObject): CSS2DObject;
}
export {};
