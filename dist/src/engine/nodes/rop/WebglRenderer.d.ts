import { TypedRopNode } from './_Base';
import { RopType } from '../../poly/registers/nodes/Rop';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
export declare const DEFAULT_OUTPUT_ENCODING: number;
export declare const DEFAULT_TONE_MAPPING: number;
export declare const SHADOW_MAP_TYPES: import("three/src/constants").ShadowMapType[];
export declare const DEFAULT_SHADOW_MAP_TYPE: number;
export interface WebGLRendererWithSampling extends WebGLRenderer {
    sampling?: number;
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class WebGlRendererRopParamsConfig extends NodeParamsConfig {
    alpha: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    antialias: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    tone_mapping: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    tone_mapping_exposure: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    output_encoding: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    physically_correct_lights: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    sort_objects: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    sampling: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    tshadow_map: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    shadow_map_auto_update: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    shadow_map_needs_update: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    shadow_map_type: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
}
export declare class WebGlRendererRopNode extends TypedRopNode<WebGlRendererRopParamsConfig> {
    params_config: WebGlRendererRopParamsConfig;
    static type(): Readonly<RopType.WEBGL>;
    private _renderers_by_canvas_id;
    create_renderer(canvas: HTMLCanvasElement, gl: WebGLRenderingContext): WebGLRendererWithSampling;
    cook(): void;
    _update_renderer(renderer: WebGLRendererWithSampling): void;
    private _traverse_scene_and_update_materials;
}
export {};
