import { TypedSopNode } from './_Base';
import { CSS3DObject } from '../../../../modules/three/examples/jsm/renderers/CSS3DRenderer';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class Css3DObjectSopParamsConfig extends NodeParamsConfig {
    class_name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    text: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
}
export declare class Css3DObjectSopNode extends TypedSopNode<Css3DObjectSopParamsConfig> {
    params_config: Css3DObjectSopParamsConfig;
    static type(): string;
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
    private _create_objects_from_input_points;
    private _create_object_from_scratch;
    private static create_css_object;
    private static _assign_clone_method;
    static clone_css_object(css_object: CSS3DObject): CSS3DObject;
}
export {};
