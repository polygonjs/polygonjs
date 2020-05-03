import { BaseJsFunctionAssembler } from './_Base';
import { OutputJsNode } from '../../Output';
import { JsConnectionPointType, JsConnectionPoint } from '../../../utils/io/connections/Js';
import { GlobalsJsNode } from '../../Globals';
export declare class PointsJsFunctionAssembler extends BaseJsFunctionAssembler {
    static add_output_params(output_child: OutputJsNode): void;
    add_output_params(output_child: OutputJsNode): void;
    static create_globals_node_output_connections(): (JsConnectionPoint<JsConnectionPointType.VEC3> | JsConnectionPoint<JsConnectionPointType.VEC2> | JsConnectionPoint<JsConnectionPointType.FLOAT>)[];
    create_globals_node_output_connections(): (JsConnectionPoint<JsConnectionPointType.VEC3> | JsConnectionPoint<JsConnectionPointType.VEC2> | JsConnectionPoint<JsConnectionPointType.FLOAT>)[];
    add_globals_params(globals_node: GlobalsJsNode): void;
}
