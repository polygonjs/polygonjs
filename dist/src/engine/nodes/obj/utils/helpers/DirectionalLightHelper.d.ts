import { DirectionalLightObjNode } from '../../DirectionalLight';
import { DirectionalLight } from 'three/src/lights/DirectionalLight';
import { BaseLightHelper } from './_BaseLightHelper';
export declare class DirectionalLightHelper extends BaseLightHelper<DirectionalLight, DirectionalLightObjNode> {
    private _square;
    private _line_material;
    protected build_helper(): void;
    update(): void;
}
