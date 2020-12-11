import {NodeJsonImporter} from "./Node";
import {ParamJsonImporter} from "./Param";
import {ParamMultipleJsonImporter} from "./param/Multiple";
import {ParamStringJsonImporter} from "./param/String";
import {ParamRampJsonImporter} from "./param/Ramp";
import {TypedMultipleParam} from "../../../params/_Multiple";
import {StringParam} from "../../../params/String";
import {RampParam} from "../../../params/Ramp";
import {PolyNodeJsonImporter} from "./nodes/Poly";
export class JsonImportDispatcher {
  static dispatch_node(node) {
    if (node.poly_node_controller) {
      return new PolyNodeJsonImporter(node);
    }
    return new NodeJsonImporter(node);
  }
  static dispatch_param(param) {
    if (param instanceof TypedMultipleParam) {
      return new ParamMultipleJsonImporter(param);
    }
    if (param instanceof StringParam) {
      return new ParamStringJsonImporter(param);
    }
    if (param instanceof RampParam) {
      return new ParamRampJsonImporter(param);
    }
    return new ParamJsonImporter(param);
  }
}
