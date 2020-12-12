import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { EffectComposer } from '../../../../modules/three/examples/jsm/postprocessing/EffectComposer';
import { DisplayNodeController, DisplayNodeControllerCallbacks } from '../../utils/DisplayNodeController';
import { PostNodeChildrenMap } from '../../../poly/registers/nodes/Post';
import { TypedNode, BaseNodeType } from '../../_Base';
import { BasePostProcessNodeType } from '../_Base';
import { Scene } from 'three/src/scenes/Scene';
import { Camera } from 'three/src/cameras/Camera';
import { Vector2 } from 'three/src/math/Vector2';
import { BaseCameraObjNodeType } from '../../obj/_BaseCamera';
import { NodeParamsConfig } from '../../utils/params/ParamsConfig';
export declare class PostProcessNetworkParamsConfig extends NodeParamsConfig {
    prepend_render_pass: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
    use_render_target: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
    tmag_filter: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
    mag_filter: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.INTEGER>;
    tmin_filter: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
    min_filter: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.INTEGER>;
    stencil_buffer: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
    sampling: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.INTEGER>;
}
export interface BaseNetworkPostProcessNodeType extends TypedNode<any, PostProcessNetworkParamsConfig> {
    readonly display_node_controller: DisplayNodeController;
    create_node<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K];
    createNode<K extends valueof<PostNodeChildrenMap>>(node_class: Constructor<K>): K;
    children(): BasePostProcessNodeType[];
    nodes_by_type<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K][];
    readonly effects_composer_controller: EffectsComposerController;
}
interface CreateEffectsComposerOptions {
    renderer: WebGLRenderer;
    scene: Scene;
    camera: Camera;
    resolution: Vector2;
    requester: BaseNodeType;
    camera_node?: BaseCameraObjNodeType;
}
export declare class EffectsComposerController {
    private node;
    constructor(node: BaseNetworkPostProcessNodeType);
    display_node_controller_callbacks(): DisplayNodeControllerCallbacks;
    create_effects_composer(options: CreateEffectsComposerOptions): EffectComposer;
    private _renderer_size;
    private _create_render_target;
    private _build_passes;
}
export {};
