import { BaseParamType } from '../_Base';
import { BaseNodeType } from '../../nodes/_Base';
import { NodeContext } from '../../poly/NodeContext';
export interface ParamOptionsMenuEntry {
    name: string;
    value: number;
}
export declare enum StringParamLanguage {
    TYPESCRIPT = "typescript"
}
export declare type VisibleIfParamOptions = Dictionary<number | boolean>;
interface BaseParamOptions {
    cook?: boolean;
    spare?: boolean;
    hidden?: boolean;
    show_label?: boolean;
    field?: boolean;
    visible_if?: VisibleIfParamOptions | VisibleIfParamOptions[];
}
export interface MenuParamOptions {
    menu?: {
        entries: ParamOptionsMenuEntry[];
    };
}
interface ExpressionParamOptions {
    expression?: {
        for_entities?: boolean;
    };
}
interface NumberParamOptions extends BaseParamOptions {
    range?: Number2;
    range_locked?: Boolean2;
    step?: number;
}
interface AssetParamOptions {
    always_reference_asset?: boolean;
}
interface DesktopParamOptions {
    desktop_browse?: Dictionary<string>;
}
interface ComputeOnDirtyParamOptions {
    compute_on_dirty?: boolean;
}
interface CallbackParamOptions {
    callback?: (node: BaseNodeType, param: BaseParamType) => any;
    callback_string?: string;
}
interface LabelParamOptions {
    label?: string;
}
export interface BooleanParamOptions extends BaseParamOptions, ComputeOnDirtyParamOptions, MenuParamOptions, ExpressionParamOptions, CallbackParamOptions {
}
export interface ButtonParamOptions extends BaseParamOptions, CallbackParamOptions, LabelParamOptions {
}
export interface ColorParamOptions extends BaseParamOptions, ExpressionParamOptions, CallbackParamOptions, ComputeOnDirtyParamOptions {
}
export interface FloatParamOptions extends NumberParamOptions, MenuParamOptions, ComputeOnDirtyParamOptions, ExpressionParamOptions, CallbackParamOptions {
}
export interface FolderParamOptions extends BaseParamOptions {
    level?: number;
}
export interface IntegerParamOptions extends NumberParamOptions, MenuParamOptions, CallbackParamOptions {
}
export interface OperatorPathParamOptions extends BaseParamOptions, DesktopParamOptions, ComputeOnDirtyParamOptions, CallbackParamOptions {
    node_selection?: {
        context?: NodeContext;
        type?: string;
    };
    dependent_on_found_node?: boolean;
}
export interface RampParamOptions extends BaseParamOptions {
}
export interface SeparatorParamOptions extends BaseParamOptions {
}
export interface StringParamOptions extends BaseParamOptions, AssetParamOptions, DesktopParamOptions, CallbackParamOptions, ExpressionParamOptions {
    multiline?: boolean;
    language?: StringParamLanguage;
}
interface VectorParamOptions extends BaseParamOptions, ExpressionParamOptions, CallbackParamOptions {
}
export interface Vector2ParamOptions extends VectorParamOptions {
}
export interface Vector3ParamOptions extends VectorParamOptions {
}
export interface Vector4ParamOptions extends VectorParamOptions {
}
export interface ParamOptions extends NumberParamOptions, ComputeOnDirtyParamOptions, FolderParamOptions, ExpressionParamOptions, ButtonParamOptions, DesktopParamOptions, MenuParamOptions, StringParamOptions, OperatorPathParamOptions {
    texture?: {
        env?: boolean;
    };
}
export declare class OptionsController {
    private _param;
    private _programatic_visible_state;
    private _options;
    private _default_options;
    constructor(_param: BaseParamType);
    set(options: ParamOptions): void;
    copy(options_controller: OptionsController): void;
    set_option(name: keyof ParamOptions, value: any): any;
    get param(): BaseParamType;
    get node(): BaseNodeType;
    get default(): ParamOptions;
    get current(): ParamOptions;
    get has_options_overridden(): boolean;
    get overridden_options(): ParamOptions;
    get overridden_option_names(): Array<keyof ParamOptions>;
    get always_reference_asset(): boolean;
    get compute_on_dirty(): boolean;
    private _compute_on_dirty_callback_added;
    private _handle_compute_on_dirty;
    has_callback(): boolean;
    execute_callback(): void;
    private get_callback;
    private create_callback_from_string;
    makes_node_dirty_when_dirty(): boolean;
    get desktop_browse_option(): Dictionary<string> | undefined;
    get desktop_browse_allowed(): boolean;
    desktop_browse_file_type(): string | null;
    get is_expression_for_entities(): boolean;
    get level(): number;
    get has_menu(): boolean;
    private get menu_options();
    get menu_entries(): ParamOptionsMenuEntry[];
    get has_menu_radio(): boolean;
    get is_multiline(): boolean;
    get language(): StringParamLanguage | undefined;
    get is_code(): boolean;
    get node_selection_options(): {
        context?: NodeContext | undefined;
        type?: string | undefined;
    } | undefined;
    get node_selection_context(): NodeContext | undefined;
    get node_selection_type(): string | undefined;
    dependent_on_found_node(): boolean | undefined;
    get range(): Number2;
    get step(): number | undefined;
    private range_locked;
    ensure_in_range(value: number): number;
    get is_spare(): boolean;
    get texture_options(): {
        env?: boolean | undefined;
    } | undefined;
    texture_as_env(): boolean;
    get is_hidden(): boolean;
    get is_visible(): boolean;
    set_visible_state(state: boolean): void;
    get label(): string | undefined;
    get is_label_hidden(): boolean;
    is_field_hidden(): boolean;
    ui_data_depends_on_other_params(): boolean;
    visibility_predecessors(): BaseParamType[];
    private _update_visibility_and_remove_dirty_bound;
    private _visibility_graph_node;
    private _ui_data_dependency_set;
    set_ui_data_dependency(): void;
    private update_visibility_and_remove_dirty;
    update_visibility(): Promise<void>;
}
export {};
