import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup } from '../../geometry/Group';
import { Vector3 } from 'three/src/math/Vector3';
import { InputCloneMode } from '../../../engine/poly/InputCloneMode';
interface TorusKnotSopParams extends DefaultOperationParams {
    radius: number;
    radius_tube: number;
    segments_radial: number;
    segments_tube: number;
    p: number;
    q: number;
    center: Vector3;
}
export declare class TorusKnotSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: TorusKnotSopParams;
    static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
    static type(): Readonly<'torus_knot'>;
    cook(input_contents: CoreGroup[], params: TorusKnotSopParams): CoreGroup;
}
export {};
