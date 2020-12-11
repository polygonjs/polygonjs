import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { InputCloneMode } from '../../../engine/poly/InputCloneMode';
interface CenterSopParams extends DefaultOperationParams {
}
export declare class CenterSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: CenterSopParams;
    static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
    static type(): Readonly<'center'>;
    private _geo_center;
    cook(input_contents: CoreGroup[], params: CenterSopParams): CoreGroup;
    private _create_object;
}
export {};
