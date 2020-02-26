import {BaseNodeType} from '../../../nodes/_Base';
import {BaseParamType} from '../../../params/_Base';

import {NodeCodeExporter} from './Node';
// import {BaseNodeObjCodeExporter} from './node/Obj';
// import {BaseNodeSopSubnetworkCodeExporter} from './node/Subnetwork';

import {ParamCodeExporter} from './Param';
import {ParamMultipleCodeExporter} from './param/Multiple';
import {ParamNumericCodeExporter} from './param/Numeric';
import {ParamOperatorPathCodeExporter} from './param/OperatorPath';
import {ParamStringCodeExporter} from './param/String';
import {ParamRampCodeExporter} from './param/Ramp';
import {TypedMultipleParam} from '../../../params/_Multiple';
import {TypedNumericParam} from '../../../params/_Numeric';
import {OperatorPathParam} from '../../../params/OperatorPath';
import {StringParam} from '../../../params/String';
import {RampParam} from '../../../params/Ramp';

export class CodeExporterDispatcher {
	static dispatch_node(node: BaseNodeType) {
		return new NodeCodeExporter(node);
	}

	// static node(node: BaseNode): NodeCodeExporter {
	// 	return new NodeCodeExporter(node);
	// }
	// static node_obj(node: BaseNode) {
	// 	return new BaseNodeObjCodeExporter(node);
	// }
	// static node_sop_subnetwork(node: BaseNode) {
	// 	return new BaseNodeSopSubnetworkCodeExporter(node);
	// }
	static dispatch_param(param: BaseParamType): ParamCodeExporter<BaseParamType> {
		if (param instanceof TypedMultipleParam) {
			return new ParamMultipleCodeExporter(param);
		}
		if (param instanceof TypedNumericParam) {
			return new ParamNumericCodeExporter(param);
		}
		if (param instanceof OperatorPathParam) {
			return new ParamOperatorPathCodeExporter(param);
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
// 	static visit_param(param: BaseParamType) {
// 		return new ParamCodeExporter(param);
// 	}
// 	static param_multiple(param: BaseParam) {
// 		return new ParamMultipleCodeExporter(param);
// 	}
// 	static param_numeric(param: BaseParam) {
// 		return new ParamNumericCodeExporter(param);
// 	}
// 	static param_operator_path(param: BaseParam) {
// 		return new ParamOperatorPathCodeExporter(param);
// 	}
// 	static param_string(param: BaseParam) {
// 		return new ParamStringCodeExporter(param);
// 	}
// 	static param_ramp(param: BaseParam) {
// 		return new ParamRampCodeExporter(param);
// 	}
// }
