import { Light } from 'three/src/lights/Light';
import { BaseLightHelper, BaseLightHelperObjNode } from './helpers/_BaseLightHelper';
export interface HelperConstructor<L extends Light> {
    new (node: BaseLightHelperObjNode<L>, name: string): BaseLightHelper<L, BaseLightHelperObjNode<L>>;
}
export declare class HelperController<L extends Light> {
    private node;
    private _helper_constructor;
    private _name;
    private _helper;
    constructor(node: BaseLightHelperObjNode<L>, _helper_constructor: HelperConstructor<L>, _name: string);
    initialize_node(): void;
    get helper(): BaseLightHelper<L, BaseLightHelperObjNode<L>> | undefined;
    get visible(): boolean;
    private _create_helper;
    update(): void;
}
