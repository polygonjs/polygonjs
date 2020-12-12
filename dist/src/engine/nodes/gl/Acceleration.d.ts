import { TypedGlNode } from './_Base';
import { GlConnectionPointType } from '../utils/io/connections/Gl';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
declare enum AccelerationGlInput {
    POSITION = "position",
    VELOCITY = "velocity",
    MASS = "mass",
    FORCE = "force"
}
declare enum AccelerationGlOutput {
    POSITION = "position",
    VELOCITY = "velocity"
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class AccelerationGlParamsConfig extends NodeParamsConfig {
}
export declare class AccelerationGlNode extends TypedGlNode<AccelerationGlParamsConfig> {
    params_config: AccelerationGlParamsConfig;
    static type(): string;
    initialize_node(): void;
    protected _expected_input_types(): GlConnectionPointType[];
    private _expected_output_types;
    protected _gl_input_name(index: number): AccelerationGlInput;
    protected _gl_output_name(index: number): AccelerationGlOutput;
    param_default_value(name: string): AttribValue;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
export {};
