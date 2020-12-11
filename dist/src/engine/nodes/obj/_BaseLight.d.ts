import { TypedObjNode } from './_Base';
import { Light } from 'three/src/lights/Light';
import { Color } from 'three/src/math/Color';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { FlagsControllerD } from '../utils/FlagsController';
import { Group } from 'three/src/objects/Group';
export declare abstract class TypedLightObjNode<L extends Light, K extends NodeParamsConfig> extends TypedObjNode<Group, K> {
    readonly flags: FlagsControllerD;
    readonly render_order: number;
    protected _color_with_intensity: Color;
    protected _light: L;
    get light(): L;
    protected abstract create_light(): L;
    protected _used_in_scene: boolean;
    initialize_base_node(): void;
    private _cook_main_without_inputs_when_dirty_bound;
    private _cook_main_without_inputs_when_dirty;
    protected set_object_name(): void;
    private update_light_attachment;
    create_shadow_params_main(): void;
    protected create_light_params(): void;
    protected update_light_params(): void;
    protected create_shadow_params(): void;
    cook(): void;
    update_shadow_params(): void;
    get color_with_intensity(): Color;
    get active(): boolean;
}
export declare type BaseLightObjNodeType = TypedLightObjNode<Light, NodeParamsConfig>;
