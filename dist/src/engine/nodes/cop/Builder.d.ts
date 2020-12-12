import { WebGLRenderTarget } from 'three/src/renderers/WebGLRenderTarget';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { TypedCopNode } from './_Base';
import { GlNodeChildrenMap } from '../../poly/registers/nodes/Gl';
import { BaseGlNodeType } from '../gl/_Base';
import { NodeContext } from '../../poly/NodeContext';
import { IUniform } from 'three/src/renderers/shaders/UniformsLib';
export interface IUniforms {
    [uniform: string]: IUniform;
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { AssemblerName } from '../../poly/registers/assemblers/_BaseRegister';
import { TexturePersistedConfig } from '../gl/code/assemblers/textures/PersistedConfig';
import { IUniformsWithTime } from '../../scene/utils/UniformsController';
import { ParamsInitData } from '../utils/io/IOController';
declare class BuilderCopParamsConfig extends NodeParamsConfig {
    resolution: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
    use_camera_renderer: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class BuilderCopNode extends TypedCopNode<BuilderCopParamsConfig> {
    params_config: BuilderCopParamsConfig;
    static type(): string;
    readonly persisted_config: TexturePersistedConfig;
    protected _assembler_controller: import("../gl/code/Controller").GlAssemblerController<import("../gl/code/assemblers/textures/Texture").ShaderAssemblerTexture> | undefined;
    used_assembler(): Readonly<AssemblerName.GL_TEXTURE>;
    protected _create_assembler_controller(): import("../gl/code/Controller").GlAssemblerController<import("../gl/code/assemblers/textures/Texture").ShaderAssemblerTexture> | undefined;
    get assembler_controller(): import("../gl/code/Controller").GlAssemblerController<import("../gl/code/assemblers/textures/Texture").ShaderAssemblerTexture> | undefined;
    private _texture_mesh;
    private _fragment_shader;
    private _uniforms;
    readonly texture_material: ShaderMaterial;
    private _texture_scene;
    private _texture_camera;
    private _render_target;
    private _data_texture_controller;
    private _renderer_controller;
    protected _children_controller_context: NodeContext;
    initialize_node(): void;
    createNode<S extends keyof GlNodeChildrenMap>(node_class: S, params_init_value_overrides?: ParamsInitData): GlNodeChildrenMap[S];
    createNode<K extends valueof<GlNodeChildrenMap>>(node_class: Constructor<K>, params_init_value_overrides?: ParamsInitData): K;
    children(): BaseGlNodeType[];
    nodes_by_type<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K][];
    children_allowed(): boolean;
    private _cook_main_without_inputs_when_dirty_bound;
    private _cook_main_without_inputs_when_dirty;
    cook(): Promise<void>;
    shaders_by_name(): {
        fragment: string | undefined;
    };
    compile_if_required(): void;
    private compile;
    static handle_dependencies(node: BuilderCopNode, time_dependent: boolean, uniforms?: IUniformsWithTime): void;
    render_on_target(): Promise<void>;
    render_target(): WebGLRenderTarget;
    private create_render_target_if_required;
    private _render_target_resolution_valid;
    private _create_render_target;
}
export {};
