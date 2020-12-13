import { HemisphereLightObjNode } from '../../HemisphereLight';
import { BaseLightHelper } from './_BaseLightHelper';
import { HemisphereLight } from 'three/src/lights/HemisphereLight';
export declare class HemisphereLightHelper extends BaseLightHelper<HemisphereLight, HemisphereLightObjNode> {
    private _geometry;
    protected build_helper(): void;
    private _quat;
    private _default_position;
    private _color1;
    private _color2;
    update(): void;
}
