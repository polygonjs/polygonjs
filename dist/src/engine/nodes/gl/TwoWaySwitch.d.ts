import { ParamlessTypedGlNode } from './_Base';
import { GlConnectionsController } from './utils/ConnectionsController';
declare enum InputName {
    CONDITION = "condition",
    IF_TRUE = "if_true",
    IF_FALSE = "if_false"
}
import { ConnectionPointType } from '../utils/connections/ConnectionPointType';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
export declare class TwoWaySwitchGlNode extends ParamlessTypedGlNode {
    static type(): string;
    readonly gl_connections_controller: GlConnectionsController;
    initialize_node(): void;
    protected _gl_input_name(index: number): InputName;
    protected _gl_output_name(): string;
    protected _expected_input_types(): ConnectionPointType[];
    protected _expected_output_types(): ConnectionPointType[];
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
export {};
