import {NodeCodeExporter} from "./Node";
import {ParamCodeExporter} from "./Param";
import {ParamMultipleCodeExporter} from "./param/Multiple";
import {ParamNumericCodeExporter} from "./param/Numeric";
import {ParamOperatorPathCodeExporter} from "./param/OperatorPath";
import {ParamNodePathCodeExporter} from "./param/NodePath";
import {ParamStringCodeExporter} from "./param/String";
import {ParamRampCodeExporter} from "./param/Ramp";
import {TypedMultipleParam} from "../../../params/_Multiple";
import {TypedNumericParam} from "../../../params/_Numeric";
import {OperatorPathParam} from "../../../params/OperatorPath";
import {NodePathParam} from "../../../params/NodePath";
import {StringParam} from "../../../params/String";
import {RampParam} from "../../../params/Ramp";
export class CodeExporterDispatcher {
  static dispatch_node(node) {
    return new NodeCodeExporter(node);
  }
  static dispatch_param(param) {
    if (param instanceof TypedMultipleParam) {
      return new ParamMultipleCodeExporter(param);
    }
    if (param instanceof TypedNumericParam) {
      return new ParamNumericCodeExporter(param);
    }
    if (param instanceof OperatorPathParam) {
      return new ParamOperatorPathCodeExporter(param);
    }
    if (param instanceof NodePathParam) {
      return new ParamNodePathCodeExporter(param);
    }
    if (param instanceof StringParam) {
      return new ParamStringCodeExporter(param);
    }
    if (param instanceof RampParam) {
      return new ParamRampCodeExporter(param);
    }
    return new ParamCodeExporter(param);
  }
}
