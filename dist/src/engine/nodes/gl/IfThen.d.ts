import { SubnetGlNode } from './Subnet';
import { GlConnectionPointType } from '../utils/io/connections/Gl';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
import { SubnetInputGlNode } from './SubnetInput';
declare class IfThenGlParamsConfig extends NodeParamsConfig {
}
export declare class IfThenGlNode extends SubnetGlNode {
    params_config: IfThenGlParamsConfig;
    static type(): Readonly<'if_then'>;
    protected _expected_inputs_count(): number;
    protected _expected_input_types(): GlConnectionPointType[];
    protected _expected_output_types(): GlConnectionPointType[];
    protected _expected_input_name(index: number): string;
    protected _expected_output_name(index: number): string;
    child_expected_input_connection_point_types(): GlConnectionPointType[];
    child_expected_input_connection_point_name(index: number): string;
    child_expected_output_connection_point_types(): GlConnectionPointType[];
    child_expected_output_connection_point_name(index: number): string;
    set_lines_block_start(shaders_collection_controller: ShadersCollectionController, child_node: SubnetInputGlNode): void;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
export {};
