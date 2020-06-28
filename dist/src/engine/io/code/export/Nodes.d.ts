import { BaseNodeType } from '../../../nodes/_Base';
export declare class NodesCodeExporter {
    private _nodes;
    _lines: string[];
    constructor(_nodes: BaseNodeType[]);
    process(parent_var_name?: string, position_x_offset?: number): string[];
    process_with_existing_nodes(parent: BaseNodeType, parent_var_name: string, position_x_offset?: number): string[];
    private add_process;
    private add_existing_nodes;
    create_function_declare(parent_var_name: string): string[];
    create_function_call(parent_var_name: string): string[];
    private multi_push;
}
