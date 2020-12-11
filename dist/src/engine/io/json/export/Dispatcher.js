import {NodeJsonExporter} from "./Node";
import {ParamJsonExporter} from "./Param";
import {ParamNumericJsonExporter} from "./param/Numeric";
import {ParamOperatorPathJsonExporter} from "./param/OperatorPath";
import {ParamStringJsonExporter} from "./param/String";
import {ParamRampJsonExporter} from "./param/Ramp";
import {TypedNumericParam} from "../../../params/_Numeric";
import {OperatorPathParam} from "../../../params/OperatorPath";
import {StringParam} from "../../../params/String";
import {RampParam} from "../../../params/Ramp";
import {PolyNodeJsonExporter} from "./nodes/Poly";
export class JsonExportDispatcher {
  static dispatch_node(node) {
    if (node.poly_node_controller) {
      return new PolyNodeJsonExporter(node);
    }
    return new NodeJsonExporter(node);
  }
  static dispatch_param(param) {
    if (param instanceof TypedNumericParam) {
      return new ParamNumericJsonExporter(param);
    }
    if (param instanceof OperatorPathParam) {
      return new ParamOperatorPathJsonExporter(param);
    }
    if (param instanceof StringParam) {
      return new ParamStringJsonExporter(param);
    }
    if (param instanceof RampParam) {
      return new ParamRampJsonExporter(param);
    }
    return new ParamJsonExporter(param);
  }
}
