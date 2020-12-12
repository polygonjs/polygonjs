import { BaseGlNodeType } from '../../_Base';
import { LineType } from './LineType';
import { BaseNodeType } from '../../../_Base';
export declare class CodeFormatter {
    static node_comment(node: BaseGlNodeType, line_type: LineType): string;
    static line_wrap(node: BaseGlNodeType, line: string, line_type: LineType): string;
    static post_line_separator(line_type: LineType): "" | "\t";
    static node_distance_to_material(node: BaseNodeType): number;
}
