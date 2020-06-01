import { WebGLRenderTarget } from 'three/src/renderers/WebGLRenderTarget';
import { TypedCopNode } from './_Base';
import { PostNodeChildrenMap } from '../../poly/registers/nodes/Post';
import { BasePostProcessNodeType } from '../post/_Base';
import { NodeContext } from '../../poly/NodeContext';
import { EffectsComposerController } from '../post/utils/EffectsComposerController';
import { Texture } from 'three/src/textures/Texture';
import { DisplayNodeController } from '../utils/DisplayNodeController';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { EffectComposer } from '../../../../modules/three/examples/jsm/postprocessing/EffectComposer';
import { IUniform } from 'three/src/renderers/shaders/UniformsLib';
export interface IUniforms {
    [uniform: string]: IUniform;
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class PostCopParamsConfig extends NodeParamsConfig {
    use_camera_renderer: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class PostCopNode extends TypedCopNode<PostCopParamsConfig> {
    params_config: PostCopParamsConfig;
    static type(): string;
    private _texture_mesh;
    private _texture_material;
    private _texture_scene;
    private _texture_camera;
    private _render_target;
    protected _composer: EffectComposer | undefined;
    private _composer_resolution;
    private _data_texture_controller;
    private _renderer_controller;
    readonly effects_composer_controller: EffectsComposerController;
    readonly display_node_controller: DisplayNodeController;
    protected _children_controller_context: NodeContext;
    initialize_node(): void;
    create_node<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K];
    children(): BasePostProcessNodeType[];
    nodes_by_type<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K][];
    cook(input_contents: Texture[]): Promise<void>;
    build_effects_composer_if_required(): void;
    private build_effects_composer;
    private render_on_target;
    render_target(): WebGLRenderTarget | undefined;
    private _copy_to_data_texture;
    private _create_render_target;
    protected _create_composer(renderer: WebGLRenderer, render_target: WebGLRenderTarget): EffectComposer;
    reset(): void;
    private _create_start_nodes;
}
export {};