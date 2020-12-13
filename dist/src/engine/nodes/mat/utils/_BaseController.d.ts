import { BaseMatNodeType } from '../_Base';
export declare class BaseController {
    protected node: BaseMatNodeType;
    constructor(node: BaseMatNodeType);
    add_params(): void;
    update(): void;
    get material(): import("three").Material;
}
