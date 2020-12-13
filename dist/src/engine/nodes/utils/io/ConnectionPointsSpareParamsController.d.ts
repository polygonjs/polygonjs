import { NodeContext } from '../../../poly/NodeContext';
import { TypedNode } from '../../_Base';
export declare class ConnectionPointsSpareParamsController<NC extends NodeContext> {
    private node;
    private _context;
    private _inputless_param_names;
    private _raw_input_serialized_by_param_name;
    private _default_value_serialized_by_param_name;
    constructor(node: TypedNode<NC, any>, _context: NC);
    private _initialized;
    initialize_node(): void;
    initialized(): boolean;
    create_inputs_from_params(): void;
    set_inputless_param_names(names: string[]): string[];
    create_spare_parameters(): void;
}
