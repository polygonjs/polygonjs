import { BaseJsDefinition } from '../../utils/JsDefinition';
import { BaseJsNodeType } from '../../_Base';
export declare class LinesController {
    private _definitions_by_node_id;
    private _body_lines_by_node_id;
    constructor();
    add_definitions(node: BaseJsNodeType, definitions: BaseJsDefinition[]): void;
    definitions(node: BaseJsNodeType): BaseJsDefinition[] | undefined;
    add_body_lines(node: BaseJsNodeType, lines: string[]): void;
    body_lines(node: BaseJsNodeType): string[] | undefined;
}
