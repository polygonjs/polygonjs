import { PointLightObjNode } from '../../PointLight';
import { BaseLightHelper } from './_BaseLightHelper';
import { PointLight } from 'three/src/lights/PointLight';
export declare class PointLightHelper extends BaseLightHelper<PointLight, PointLightObjNode> {
    protected build_helper(): void;
    update(): void;
}
