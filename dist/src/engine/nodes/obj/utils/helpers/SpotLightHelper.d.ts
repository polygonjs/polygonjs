import { SpotLightObjNode } from '../../SpotLight';
import { BaseLightHelper } from './_BaseLightHelper';
import { SpotLight } from 'three/src/lights/SpotLight';
export declare class SpotLightHelper extends BaseLightHelper<SpotLight, SpotLightObjNode> {
    private _cone;
    private _line_material;
    protected build_helper(): void;
    private _matrix_scale;
    update(): void;
}
