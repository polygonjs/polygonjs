import { TypedSopNode } from './_Base';
export declare enum TEXT_TYPE {
    MESH = "mesh",
    FLAT = "flat",
    LINE = "line",
    STROKE = "stroke"
}
export declare const TEXT_TYPES: Array<TEXT_TYPE>;
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ModuleName } from '../../poly/registers/modules/_BaseRegister';
declare class TextSopParamsConfig extends NodeParamsConfig {
    font: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    text: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    type: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    size: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    extrude: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    segments: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    stroke_width: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class TextSopNode extends TypedSopNode<TextSopParamsConfig> {
    params_config: TextSopParamsConfig;
    static type(): string;
    private _font_loader;
    private _loaded_fonts;
    initialize_node(): void;
    cook(): Promise<void>;
    private _create_geometry_from_type_mesh;
    private _create_geometry_from_type_flat;
    private _create_geometry_from_type_line;
    private _create_geometry_from_type_stroke;
    private shapes_from_font;
    private _get_shapes;
    private displayed_text;
    private _load_url;
    required_modules(): Promise<ModuleName[] | undefined>;
    private get_extension;
    private _load_ttf;
    private _load_json;
    private _load_ttf_loader;
    private _load_svg_loader;
}
export {};
