import {BaseNodeType} from 'src/engine/nodes/_Base';
import {BaseParamType} from 'src/engine/params/_Base';

import {NodeJsonExporter} from './Node';
// import {BaseNodeObjJsonExporter} from './node/Obj';
// import {BaseNodeSopSubnetworkJsonExporter} from './node/Subnetwork';

import {ParamJsonExporter} from './Param';
import {ParamMultipleJsonExporter} from './param/Multiple';
import {ParamNumericJsonExporter} from './param/Numeric';
import {ParamOperatorPathJsonExporter} from './param/OperatorPath';
import {ParamStringJsonExporter} from './param/String';
import {ParamRampJsonExporter} from './param/Ramp';
// import {TypedObjNode} from 'src/engine/nodes/obj/_Base';
import {TypedMultipleParam} from 'src/engine/params/_Multiple';
import {TypedNumericParam} from 'src/engine/params/_Numeric';
import {OperatorPathParam} from 'src/engine/params/OperatorPath';
import {StringParam} from 'src/engine/params/String';
import {RampParam} from 'src/engine/params/Ramp';

export class JsonExportDispatcher {
	static dispatch_node(node: BaseNodeType) {
		// if (node instanceof TypedObjNode) {
		// 	return new BaseNodeObjJsonExporter(node);
		// }
		return new NodeJsonExporter(node);
	}

	static dispatch_param(param: BaseParamType) {
		if (param instanceof TypedMultipleParam) {
			return new ParamMultipleJsonExporter(param);
		}
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
