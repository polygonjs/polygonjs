import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup } from '../../geometry/Group';
import { Vector3 } from 'three/src/math/Vector3';
import { InputCloneMode } from '../../../engine/poly/InputCloneMode';
interface TorusSopParams extends DefaultOperationParams {
    radius: number;
    radius_tube: number;
    segments_radial: number;
    segments_tube: number;
    center: Vector3;
}
export declare class TorusSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: TorusSopParams;
    static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
    static type(): Readonly<'torus'>;
    cook(input_contents: CoreGroup[], params: TorusSopParams): CoreGroup;
}
export {};
