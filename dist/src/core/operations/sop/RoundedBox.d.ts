import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup } from '../../geometry/Group';
import { Vector3 } from 'three/src/math/Vector3';
import { InputCloneMode } from '../../../engine/poly/InputCloneMode';
interface RoundedBoxSopParams extends DefaultOperationParams {
    size: number;
    divisions: number;
    bevel: number;
    center: Vector3;
}
export declare class RoundedBoxSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: RoundedBoxSopParams;
    static readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
    static type(): Readonly<'rounded_box'>;
    private _core_transform;
    cook(input_contents: CoreGroup[], params: RoundedBoxSopParams): CoreGroup;
    private _cook_without_input;
    private _cook_with_input;
}
export {};
