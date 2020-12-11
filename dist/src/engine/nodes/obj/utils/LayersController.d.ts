import { BaseObjNodeType } from '../_Base';
export declare function LayerParamConfig<TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        layer: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.INTEGER>;
    };
} & TBase;
export declare class LayersController {
    private node;
    constructor(node: BaseObjNodeType);
    update(): void;
}
