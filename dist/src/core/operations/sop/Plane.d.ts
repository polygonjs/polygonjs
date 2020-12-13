import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';
import { CoreGroup } from '../../../core/geometry/Group';
import { InputCloneMode } from '../../../engine/poly/InputCloneMode';
interface PlaneSopParams extends DefaultOperationParams {
    size: Vector2;
    use_segments_count: boolean;
    step_size: number;
    segments: Vector2;
    direction: Vector3;
    center: Vector3;
}
export declare class PlaneSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: PlaneSopParams;
    static readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
    static type(): Readonly<'plane'>;
    private _core_transform;
    cook(input_contents: CoreGroup[], params: PlaneSopParams): CoreGroup;
    private _cook_without_input;
    private _cook_with_input;
    private _create_plane;
}
export {};
