import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { InputCloneMode } from '../../../engine/poly/InputCloneMode';
interface AttribPromoteSopParams extends DefaultOperationParams {
    class_from: number;
    class_to: number;
    mode: number;
    name: string;
}
export declare enum AttribPromoteMode {
    MIN = 0,
    MAX = 1,
    FIRST_FOUND = 2
}
export declare class AttribPromoteSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: AttribPromoteSopParams;
    static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
    static type(): Readonly<'attrib_promote'>;
    private _core_group;
    private _core_object;
    private _values_per_attrib_name;
    private _filtered_values_per_attrib_name;
    cook(input_contents: CoreGroup[], params: AttribPromoteSopParams): CoreGroup;
    private find_values;
    private _find_values_for_attrib_name;
    private find_values_from_points;
    private find_values_from_object;
    private filter_values;
    private set_values;
    private set_values_to_points;
    private set_values_to_object;
}
export {};
