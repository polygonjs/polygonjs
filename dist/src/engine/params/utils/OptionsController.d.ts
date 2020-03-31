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
interface BaseParamOptions {
    cook?: boolean;
    spare?: boolean;
    hidden?: boolean;
    label?: boolean;
    field?: boolean;
    visible_if?: Dictionary<number | boolean>;
}
interface MenuParamOptions {
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
interface CallbackParamOptions {
    callback?: (node: BaseNodeType, param: BaseParamType) => any;
    callback_string?: string;
}
export interface BooleanParamOptions extends BaseParamOptions, MenuParamOptions, ExpressionParamOptions, CallbackParamOptions {
}
export interface ButtonParamOptions extends BaseParamOptions, CallbackParamOptions {
}
export interface ColorParamOptions extends BaseParamOptions, ExpressionParamOptions {
}
export interface FloatParamOptions extends NumberParamOptions, MenuParamOptions, ExpressionParamOptions, CallbackParamOptions {
}
export interface FolderParamOptions extends BaseParamOptions {
    level?: number;
}
export interface IntegerParamOptions extends NumberParamOptions, MenuParamOptions, CallbackParamOptions {
}
export interface OperatorPathParamOptions extends BaseParamOptions, DesktopParamOptions, CallbackParamOptions {
    node_selection?: {
        context?: NodeContext;
    };
    dependent_on_found_node?: boolean;
}
export interface RampParamOptions extends BaseParamOptions {
}
export interface SeparatorParamOptions extends BaseParamOptions {
}
export interface StringParamOptions extends BaseParamOptions, AssetParamOptions, DesktopParamOptions, ExpressionParamOptions {
    multiline?: boolean;
    language?: StringParamLanguage;
}
export interface Vector2ParamOptions extends BaseParamOptions, ExpressionParamOptions {
}
export interface Vector3ParamOptions extends BaseParamOptions, ExpressionParamOptions {
}
export interface Vector4ParamOptions extends BaseParamOptions, ExpressionParamOptions {
}
export interface ParamOptions extends NumberParamOptions, FolderParamOptions, ExpressionParamOptions, ButtonParamOptions, DesktopParamOptions, MenuParamOptions, StringParamOptions, OperatorPathParamOptions {
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
    } | undefined;
    get node_selection_context(): NodeContext | undefined;
    dependent_on_found_node(): boolean | undefined;
    get range(): Number2;
    get step(): number;
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
