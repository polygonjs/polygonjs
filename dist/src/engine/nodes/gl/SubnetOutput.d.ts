import { TypedGlNode } from './_Base';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { NetworkChildNodeType } from '../../poly/NodeContext';
import { SubnetGlNode } from './Subnet';
declare class SubnetOutputGlParamsConfig extends NodeParamsConfig {
}
export declare class SubnetOutputGlNode extends TypedGlNode<SubnetOutputGlParamsConfig> {
    params_config: SubnetOutputGlParamsConfig;
    static type(): Readonly<NetworkChildNodeType.OUTPUT>;
    initialize_node(): void;
    get parent(): SubnetGlNode | null;
    protected _expected_input_name(index: number): string;
    protected _expected_input_types(): import("../utils/io/connections/Gl").GlConnectionPointType[];
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
export {};
