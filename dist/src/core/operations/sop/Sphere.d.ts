import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup } from '../../geometry/Group';
import { IcosahedronBufferGeometry } from 'three/src/geometries/IcosahedronBufferGeometry';
import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';
import { InputCloneMode } from '../../../engine/poly/InputCloneMode';
interface SphereSopParams extends DefaultOperationParams {
    type: number;
    radius: number;
    resolution: Vector2;
    open: boolean;
    phi_start: number;
    phi_length: number;
    theta_start: number;
    theta_length: number;
    detail: number;
    center: Vector3;
}
declare enum SphereType {
    DEFAULT = "default",
    ISOCAHEDRON = "isocahedron"
}
declare type SphereTypes = {
    [key in SphereType]: number;
};
export declare const SPHERE_TYPE: SphereTypes;
export declare const SPHERE_TYPES: Array<SphereType>;
export declare class SphereSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: SphereSopParams;
    static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
    static type(): Readonly<'sphere'>;
    cook(input_contents: CoreGroup[], params: SphereSopParams): CoreGroup;
    private _cook_without_input;
    private _cook_with_input;
    private _create_required_geometry;
    private _create_default_sphere;
    _create_default_isocahedron(params: SphereSopParams): IcosahedronBufferGeometry;
}
export {};
