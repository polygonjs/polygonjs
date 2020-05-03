import { BaseGlNodeType } from '../../_Base';
import { LineType } from './LineType';
export declare class CodeFormatter {
    static node_comment(node: BaseGlNodeType, line_type: LineType): string;
    static line_wrap(line: string, line_type: LineType): string;
    static post_line_separator(line_type: LineType): "" | "\t";
}
