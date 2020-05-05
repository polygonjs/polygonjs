import { TypedNode } from '../_Base';
import { Texture } from 'three/src/textures/Texture';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { NodeContext } from '../../poly/NodeContext';
import { PolyScene } from '../../scene/PolyScene';
import { FlagsControllerB } from '../utils/FlagsController';
export declare class TypedCopNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.COP, K> {
    readonly flags: FlagsControllerB;
    static node_context(): NodeContext;
    static displayed_input_names(): string[];
    constructor(scene: PolyScene);
    initialize_base_node(): void;
    set_texture(texture: Texture): void;
    clear_texture(): void;
}
export declare type BaseCopNodeType = TypedCopNode<any>;
export declare class BaseCopNodeClass extends TypedCopNode<any> {
}
