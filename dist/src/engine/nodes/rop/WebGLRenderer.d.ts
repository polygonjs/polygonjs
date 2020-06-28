import { TypedRopNode } from './_Base';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
export declare const DEFAULT_OUTPUT_ENCODING: number;
export declare const DEFAULT_TONE_MAPPING: number;
export declare const SHADOW_MAP_TYPES: import("three/src/constants").ShadowMapType[];
export declare const DEFAULT_SHADOW_MAP_TYPE: number;
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class WebGlRendererRopParamsConfig extends NodeParamsConfig {
    alpha: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    antialias: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    tone_mapping: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    tone_mapping_exposure: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    output_encoding: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    gamma_factor: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    shadow_map_type: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    sort_objects: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class WebGlRendererRopNode extends TypedRopNode<WebGlRendererRopParamsConfig> {
    params_config: WebGlRendererRopParamsConfig;
    static type(): Readonly<'webgl_renderer'>;
    private _renderers_by_canvas_id;
    create_renderer(canvas: HTMLCanvasElement, gl: WebGLRenderingContext): WebGLRenderer;
    cook(): void;
    _update_renderer(renderer: WebGLRenderer): void;
    private _traverse_scene_and_update_materials;
}
export {};
