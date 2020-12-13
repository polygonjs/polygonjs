import {CATEGORY_JS} from "./Category";
import {AttributeJsNode} from "../../../nodes/js/Attribute";
import {GlobalsJsNode} from "../../../nodes/js/Globals";
import {OutputJsNode} from "../../../nodes/js/Output";
import {ParamJsNode} from "../../../nodes/js/Param";
export class JsRegister {
  static run(poly) {
    poly.registerNode(AttributeJsNode, CATEGORY_JS.GLOBALS);
    poly.registerNode(GlobalsJsNode, CATEGORY_JS.GLOBALS);
    poly.registerNode(OutputJsNode, CATEGORY_JS.GLOBALS);
    poly.registerNode(ParamJsNode, CATEGORY_JS.GLOBALS);
  }
}
