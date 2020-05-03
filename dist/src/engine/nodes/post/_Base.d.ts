import { Camera } from 'three/src/cameras/Camera';
import { Vector2 } from 'three/src/math/Vector2';
import { TypedNode, BaseNodeType } from '../_Base';
import { EffectComposer } from '../../../../modules/three/examples/jsm/postprocessing/EffectComposer';
import { BaseCameraObjNodeType } from '../obj/_BaseCamera';
import { NodeContext } from '../../poly/NodeContext';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { Scene } from 'three/src/scenes/Scene';
import { FlagsControllerB } from '../utils/FlagsController';
import { Pass } from '../../../../modules/three/examples/jsm/postprocessing/Pass';
import { BaseParamType } from '../../params/_Base';
export interface TypedPostNodeContext {
    composer: EffectComposer;
    camera: Camera;
    resolution: Vector2;
    camera_node: BaseCameraObjNodeType;
    scene: Scene;
    canvas: HTMLCanvasElement;
}
declare function PostParamCallback(node: BaseNodeType, param: BaseParamType): void;
export declare const PostParamOptions: {
    cook: boolean;
    callback: typeof PostParamCallback;
};
export declare class TypedPostProcessNode<P extends Pass, K extends NodeParamsConfig> extends TypedNode<NodeContext.POST, K> {
    static node_context(): NodeContext;
    readonly flags: FlagsControllerB;
    protected _passes_by_canvas_id: Map<string, P>;
    static displayed_input_names(): string[];
    initialize_node(): void;
    set_render_pass(render_pass: any): void;
    cook(): void;
    setup_composer(context: TypedPostNodeContext): void;
    protected _create_pass(context: TypedPostNodeContext): P | undefined;
    static PARAM_CALLBACK_update_passes(node: BasePostProcessNodeType): void;
    private _update_pass_bound;
    private update_passes;
    protected update_pass(pass: P): void;
}
export declare type BasePostProcessNodeType = TypedPostProcessNode<Pass, NodeParamsConfig>;
export declare class BasePostProcessNodeClass extends TypedPostProcessNode<Pass, NodeParamsConfig> {
}
export {};
