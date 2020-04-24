import { TypedCopNode } from './_Base';
import { GlAssemblerController } from '../gl/code/Controller';
import { ShaderAssemblerTexture } from '../gl/code/assemblers/textures/Texture';
import { IUniform } from 'three/src/renderers/shaders/UniformsLib';
export interface IUniforms {
    [uniform: string]: IUniform;
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { GlNodeChildrenMap } from '../../poly/registers/nodes/Gl';
import { BaseGlNodeType } from '../gl/_Base';
import { NodeContext } from '../../poly/NodeContext';
declare class BuilderCopParamsConfig extends NodeParamsConfig {
    resolution: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
}
export declare class BuilderCopNode extends TypedCopNode<BuilderCopParamsConfig> {
    params_config: BuilderCopParamsConfig;
    static type(): string;
    protected _assembler_controller: GlAssemblerController<ShaderAssemblerTexture>;
    private _create_assembler_controller;
    get assembler_controller(): GlAssemblerController<ShaderAssemblerTexture>;
    private _texture_mesh;
    private _fragment_shader;
    private _uniforms;
    private _texture_material;
    private _texture_scene;
    private _texture_camera;
    private _render_target;
    private _renderer;
    private _pixelBuffer;
    protected _children_controller_context: NodeContext;
    initialize_node(): void;
    create_node<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K];
    children(): BaseGlNodeType[];
    nodes_by_type<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K][];
    private _reset_if_resolution_changed;
    private _reset;
    private _create_pixel_buffer;
    cook(): Promise<void>;
    shaders_by_name(): {
        fragment: string | undefined;
    };
    compile_if_required(): Promise<void>;
    private run_assembler;
    private _create_renderer;
    render_on_target(): Promise<void>;
    private _create_render_target;
}
export {};
