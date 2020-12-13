import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup, Object3DWithGeometry } from '../../geometry/Group';
import { InputCloneMode } from '../../../engine/poly/InputCloneMode';
interface MergeSopParams extends DefaultOperationParams {
    compact: boolean;
}
export declare class MergeSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: MergeSopParams;
    static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
    static type(): Readonly<'merge'>;
    cook(input_contents: CoreGroup[], params: MergeSopParams): CoreGroup;
    _make_compact(all_objects: Object3DWithGeometry[]): Object3DWithGeometry[];
}
export {};
