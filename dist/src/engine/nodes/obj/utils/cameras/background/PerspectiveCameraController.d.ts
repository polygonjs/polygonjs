import { BaseBackgroundController } from './_BaseController';
import { Vector3 } from 'three/src/math/Vector3';
export declare class PerspectiveCameraBackgroundController extends BaseBackgroundController {
    private _bg_corner;
    private _bg_center;
    protected update_screen_quad(): void;
    _update_corner_vector(vector: Vector3, coord: Vector2Like): void;
}
