import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup } from '../../geometry/Group';
import { Vector3 } from 'three/src/math/Vector3';
import { InputCloneMode } from '../../../engine/poly/InputCloneMode';
interface JitterSopParams extends DefaultOperationParams {
    amount: number;
    mult: Vector3;
    seed: number;
}
export declare class JitterSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: JitterSopParams;
    static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
    static type(): Readonly<'jitter'>;
    cook(input_contents: CoreGroup[], params: JitterSopParams): CoreGroup;
}
export {};
