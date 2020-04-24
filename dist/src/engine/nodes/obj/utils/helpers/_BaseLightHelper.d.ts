import { Mesh } from 'three/src/objects/Mesh';
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { NodeParamsConfig } from '../../../utils/params/ParamsConfig';
import { TypedObjNode } from '../../_Base';
import { Group } from 'three/src/objects/Group';
import { Light } from 'three/src/lights/Light';
import { FlagsControllerD } from '../../../utils/FlagsController';
export declare function BaseLightHelperParamConfig<TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        show_helper: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.BOOLEAN>;
        helper_size: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.FLOAT>;
    };
} & TBase;
declare const BaseLightHelperParamsConfig_base: {
    new (...args: any[]): {
        show_helper: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.BOOLEAN>;
        helper_size: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.FLOAT>;
    };
} & typeof NodeParamsConfig;
declare class BaseLightHelperParamsConfig extends BaseLightHelperParamsConfig_base {
}
export declare abstract class BaseLightHelperObjNode<L extends Light> extends TypedObjNode<Group, BaseLightHelperParamsConfig> {
    readonly flags: FlagsControllerD;
    abstract get light(): L;
}
export declare abstract class BaseLightHelper<L extends Light, N extends BaseLightHelperObjNode<L>> {
    protected node: N;
    private _name;
    protected _object: Mesh;
    protected _material: MeshBasicMaterial;
    constructor(node: N, _name: string);
    build(): void;
    protected abstract build_helper(): void;
    get object(): Mesh;
    abstract update(): void;
}
export {};
