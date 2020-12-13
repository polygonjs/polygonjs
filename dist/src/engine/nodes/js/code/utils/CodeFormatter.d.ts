import { BaseJsNodeType } from '../../_Base';
import { JsLineType } from './LineType';
export declare class JsCodeFormatter {
    static node_comment(node: BaseJsNodeType, line_type: JsLineType): string;
    static line_wrap(line: string, line_type: JsLineType): string;
    static post_line_separator(line_type: JsLineType): "" | "\t";
}
