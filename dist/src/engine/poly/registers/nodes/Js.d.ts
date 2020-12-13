import { AttributeJsNode } from '../../../nodes/js/Attribute';
import { GlobalsJsNode } from '../../../nodes/js/Globals';
import { OutputJsNode } from '../../../nodes/js/Output';
import { ParamJsNode } from '../../../nodes/js/Param';
export interface JsNodeChildrenMap {
    attribute: AttributeJsNode;
    globals: GlobalsJsNode;
    output: OutputJsNode;
    param: ParamJsNode;
}
import { Poly } from '../../../Poly';
export declare class JsRegister {
    static run(poly: Poly): void;
}
