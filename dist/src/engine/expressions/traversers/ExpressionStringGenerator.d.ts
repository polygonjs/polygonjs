import { BaseParamType } from '../../params/_Base';
import { ParsedTree } from './ParsedTree';
import jsep from 'jsep';
import { BaseTraverser } from './_Base';
export declare class ExpressionStringGenerator extends BaseTraverser {
    param: BaseParamType;
    constructor(param: BaseParamType);
    parse_tree(parsed_tree: ParsedTree): string | undefined;
    protected traverse_CallExpression(node: jsep.CallExpression): string;
    protected traverse_UnaryExpression(node: jsep.UnaryExpression): string;
    protected traverse_Identifier(node: jsep.Identifier): string;
}
