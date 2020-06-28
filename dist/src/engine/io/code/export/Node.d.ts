import { BaseNodeType } from '../../../nodes/_Base';
interface PositionData {
    position_x_offset?: number;
}
export declare class NodeCodeExporter {
    protected _node: BaseNodeType;
    _lines: string[];
    constructor(_node: BaseNodeType);
    create(parent_var_name?: string): string[];
    set_up(options?: object): string[];
    create_function_declare(parent_var_name?: string): string[];
    create_function_call(parent_var_name?: string): string;
    var_name(): string;
    protected function_name(): string;
    private is_root;
    private reset;
    protected add_create(parent_var_name?: string): void;
    protected add_name(): void;
    protected add_input(): void;
    protected add_comment(): void;
    protected add_position(options?: PositionData): void;
    protected add_params(): void;
    protected add_input_clonable_state(): void;
    protected add_bypass_flag(): void;
    protected add_display_flag(): void;
    protected add_children(): void;
    protected add_custom(): void;
    protected add_selection(): void;
}
export {};
