import { DeleteSopNode } from '../../Delete';
import { CoreEntity } from '../../../../../core/geometry/Entity';
export declare class ByExpressionHelper {
    private node;
    constructor(node: DeleteSopNode);
    eval_for_entities(entities: CoreEntity[]): Promise<void>;
    private eval_expressions_for_points_with_expression;
    private eval_expressions_without_expression;
}
