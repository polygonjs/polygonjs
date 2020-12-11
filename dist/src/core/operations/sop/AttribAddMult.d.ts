import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { InputCloneMode } from '../../../engine/poly/InputCloneMode';
interface AttribAddMultSopParams extends DefaultOperationParams {
    name: string;
    pre_add: number;
    mult: number;
    post_add: number;
}
export declare class AttribAddMultSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: AttribAddMultSopParams;
    static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
    static type(): Readonly<'attrib_add_mult'>;
    cook(input_contents: CoreGroup[], params: AttribAddMultSopParams): CoreGroup;
    private _update_attrib;
}
export {};
