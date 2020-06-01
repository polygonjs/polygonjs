import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { WebGLRenderTarget } from 'three/src/renderers/WebGLRenderTarget';
import { EffectComposer } from '../../../../../modules/three/examples/jsm/postprocessing/EffectComposer';
import { DisplayNodeController, DisplayNodeControllerCallbacks } from '../../utils/DisplayNodeController';
import { PostNodeChildrenMap } from '../../../poly/registers/nodes/Post';
import { BaseNodeType } from '../../_Base';
import { BasePostProcessNodeType } from '../_Base';
import { Scene } from 'three/src/scenes/Scene';
import { Camera } from 'three/src/cameras/Camera';
import { Vector2 } from 'three/src/math/Vector2';
import { BaseCameraObjNodeType } from '../../obj/_BaseCamera';
export interface BaseNetworkPostProcessNodeType extends BaseNodeType {
    readonly display_node_controller: DisplayNodeController;
    create_node<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K];
    children(): BasePostProcessNodeType[];
    nodes_by_type<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K][];
    readonly effects_composer_controller: EffectsComposerController;
}
interface CreateEffectsComposerOptions {
    renderer: WebGLRenderer;
    scene: Scene;
    camera: Camera;
    resolution: Vector2;
    render_target?: WebGLRenderTarget;
    requester: BaseNodeType;
    camera_node?: BaseCameraObjNodeType;
    prepend_render_pass?: boolean;
}
export declare class EffectsComposerController {
    private node;
    constructor(node: BaseNetworkPostProcessNodeType);
    display_node_controller_callbacks(): DisplayNodeControllerCallbacks;
    create_effects_composer(options: CreateEffectsComposerOptions): EffectComposer;
    private _build_passes;
}
export {};
