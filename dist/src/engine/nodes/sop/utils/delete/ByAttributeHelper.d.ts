import { DeleteSopNode } from '../../Delete';
import { CoreEntity } from '../../../../../core/geometry/Entity';
export declare enum ComparisonOperator {
    EQUAL = "==",
    LESS_THAN = "<",
    EQUAL_OR_LESS_THAN = "<=",
    EQUAL_OR_GREATER_THAN = ">=",
    GREATER_THAN = ">",
    DIFFERENT = "!="
}
export declare const COMPARISON_OPERATORS: Array<ComparisonOperator>;
export declare const ComparisonOperatorMenuEntries: {
    name: ComparisonOperator;
    value: number;
}[];
export declare class ByAttributeHelper {
    private node;
    constructor(node: DeleteSopNode);
    eval_for_entities(entities: CoreEntity[]): void;
    private _eval_for_string;
    private _eval_for_numeric;
    private _eval_for_points_numeric_float;
    private _eval_for_points_numeric_vector2;
    private _eval_for_points_numeric_vector3;
    private _eval_for_points_numeric_vector4;
}
