import {BaseNodeType} from 'src/engine/nodes/_Base';
import {BaseParamType} from 'src/engine/params/_Base';

import {NodeJsonImporter} from './Node';
// import {BaseNodeObjJsonImporter} from './node/Obj';
// import {BaseNodeSopSubnetworkJsonImporter} from './node/Subnetwork';

import {ParamJsonImporter} from './Param';
import {ParamMultipleJsonImporter} from './param/Multiple';
import {ParamNumericJsonImporter} from './param/Numeric';
import {ParamOperatorPathJsonImporter} from './param/OperatorPath';
import {ParamStringJsonImporter} from './param/String';
import {ParamRampJsonImporter} from './param/Ramp';
// import {TypedObjNode} from 'src/engine/nodes/obj/_Base';
import {TypedMultipleParam} from 'src/engine/params/_Multiple';
import {TypedNumericParam} from 'src/engine/params/_Numeric';
import {OperatorPathParam} from 'src/engine/params/OperatorPath';
import {StringParam} from 'src/engine/params/String';
import {RampParam} from 'src/engine/params/Ramp';

export class JsonImportDispatcher {
	static dispatch_node(node: BaseNodeType) {
		// if (node instanceof TypedObjNode) {
		// 	return new BaseNodeObjJsonImporter(node);
		// }
		return new NodeJsonImporter(node);
	}

	static dispatch_param(param: BaseParamType) {
		if (param instanceof TypedMultipleParam) {
			return new ParamMultipleJsonImporter(param);
		}
		if (param instanceof TypedNumericParam) {
			return new ParamNumericJsonImporter(param);
		}
		if (param instanceof OperatorPathParam) {
			return new ParamOperatorPathJsonImporter(param);
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

// export class CodeImporterVisitor {
// 	static node(node: BaseNode): NodeCodeImporter {
// 		return new NodeCodeImporter(node);
// 	}
// 	static node_obj(node: BaseNode) {
// 		return new BaseNodeObjCodeImporter(node);
// 	}
// 	static node_sop_subnetwork(node: BaseNode) {
// 		return new BaseNodeSopSubnetworkCodeImporter(node);
// 	}

// 	static visit_param(param: BaseParam) {
// 		return new ParamCodeImporter(param);
// 	}
// 	static param_multiple(param: BaseParam) {
// 		return new ParamMultipleCodeImporter(param);
// 	}
// 	static param_numeric(param: BaseParam) {
// 		return new ParamNumericCodeImporter(param);
// 	}
// 	static param_operator_path(param: BaseParam) {
// 		return new ParamOperatorPathCodeImporter(param);
// 	}
// 	static param_string(param: BaseParam) {
// 		return new ParamStringCodeImporter(param);
// 	}
// 	static param_ramp(param: BaseParam) {
// 		return new ParamRampCodeImporter(param);
// 	}
// }
