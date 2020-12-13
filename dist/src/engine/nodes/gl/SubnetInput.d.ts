import { TypedGlNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
import { NetworkChildNodeType } from '../../poly/NodeContext';
import { SubnetGlNode } from './Subnet';
declare class SubnetInputGlParamsConfig extends NodeParamsConfig {
}
export declare class SubnetInputGlNode extends TypedGlNode<SubnetInputGlParamsConfig> {
    params_config: SubnetInputGlParamsConfig;
    static type(): NetworkChildNodeType;
    initialize_node(): void;
    get parent(): SubnetGlNode | null;
    private _expected_output_names;
    protected _expected_output_types(): import("../utils/io/connections/Gl").GlConnectionPointType[];
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
export {};
