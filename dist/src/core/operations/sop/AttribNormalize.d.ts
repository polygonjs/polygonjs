import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { InputCloneMode } from '../../../engine/poly/InputCloneMode';
interface AttribNormalizeSopParams extends DefaultOperationParams {
    mode: number;
    name: string;
    change_name: boolean;
    new_name: string;
}
export declare enum NormalizeMode {
    MIN_MAX_TO_01 = "min/max to 0/1",
    VECTOR_TO_LENGTH_1 = "vectors to length 1"
}
export declare const NORMALIZE_MODES: NormalizeMode[];
export declare class AttribNormalizeSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: AttribNormalizeSopParams;
    static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
    static type(): Readonly<'attrib_normalize'>;
    cook(input_contents: CoreGroup[], params: AttribNormalizeSopParams): CoreGroup;
    private _normalize_attribute;
    private min3;
    private max3;
    private _normalize_from_min_max_to_01;
    private _vec;
    private _normalize_vectors;
}
export {};
