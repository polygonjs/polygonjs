import { BaseOperation } from '../_Base';
import { NodeContext } from '../../../engine/poly/NodeContext';
import { Texture } from 'three/src/textures/Texture';
export declare class BaseCopOperation extends BaseOperation {
    static context(): NodeContext;
    cook(input_contents: Texture[], params: any): Texture | Promise<Texture> | void;
}
