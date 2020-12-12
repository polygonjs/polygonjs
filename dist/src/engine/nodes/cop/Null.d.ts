import { Texture } from 'three/src/textures/Texture';
import { TypedCopNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
export declare class NullCopNode extends TypedCopNode<NodeParamsConfig> {
    params_config: NodeParamsConfig;
    static type(): string;
    initialize_node(): void;
    cook(input_contents: Texture[]): Promise<void>;
}
