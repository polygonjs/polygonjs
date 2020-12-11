import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup } from '../../geometry/Group';
import { Vector3 } from 'three/src/math/Vector3';
import { InputCloneMode } from '../../../engine/poly/InputCloneMode';
interface BoxSopParams extends DefaultOperationParams {
    size: number;
    divisions: number;
    center: Vector3;
}
export declare class BoxSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: BoxSopParams;
    static readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
    static type(): Readonly<'box'>;
    private _core_transform;
    cook(input_contents: CoreGroup[], params: BoxSopParams): CoreGroup;
    private _cook_without_input;
    private _cook_with_input;
}
export {};
