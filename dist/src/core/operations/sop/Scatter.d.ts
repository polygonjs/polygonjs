import { BaseSopOperation } from './_Base';
import { CoreGroup } from '../../geometry/Group';
import { DefaultOperationParams } from '../_Base';
import { InputCloneMode } from '../../../engine/poly/InputCloneMode';
interface ScatterSopParams extends DefaultOperationParams {
    points_count: number;
    seed: number;
    transfer_attributes: boolean;
    attributes_to_transfer: string;
    add_id_attribute: boolean;
    add_idn_attribute: boolean;
}
export declare class ScatterSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: ScatterSopParams;
    static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
    static type(): Readonly<'scatter'>;
    cook(input_contents: CoreGroup[], params: ScatterSopParams): Promise<CoreGroup>;
}
export {};
