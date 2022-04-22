import {BaseNodeType} from '../../../nodes/_Base';
import {BaseParamType} from '../../../params/_Base';

import {NodeJsonExporter} from './Node';
// import {BaseNodeObjJsonExporter} from './node/Obj';
// import {BaseNodeSopSubnetworkJsonExporter} from './node/Subnetwork';

import {ParamJsonExporter} from './Param';
// import {ParamMultipleJsonExporter} from './param/Multiple';
import {ParamNumericJsonExporter} from './param/Numeric';
// import {ParamOperatorPathJsonExporter} from './param/OperatorPath';
import {ParamNodePathJsonExporter} from './param/NodePath';
import {ParamParamPathJsonExporter} from './param/ParamPath';

import {ParamStringJsonExporter} from './param/String';
import {ParamRampJsonExporter} from './param/Ramp';
// import {TypedObjNode} from '../../../nodes/obj/_Base';
// import {TypedMultipleParam} from '../../../params/_Multiple';
import {TypedNumericParam} from '../../../params/_Numeric';
// import {OperatorPathParam} from '../../../params/OperatorPath';
import {NodePathParam} from '../../../params/NodePath';
import {ParamPathParam} from '../../../params/ParamPath';
import {StringParam} from '../../../params/String';
import {RampParam} from '../../../params/Ramp';
// import {PolySopNode} from '../../../nodes/sop/Poly';
// import {PolyObjNode} from '../../../nodes/obj/Poly';
import {PolyNodeJsonExporter} from './nodes/Poly';

export class JsonExportDispatcher {
	dispatchNode(node: BaseNodeType) {
		// using PolySopNode and PolyObjNode seem to create circular dependency with webpack
		// if (node instanceof PolySopNode || node instanceof PolyObjNode)
		if (node.polyNodeController) {
			return new PolyNodeJsonExporter(node, this);
		}
		return new NodeJsonExporter(node, this);
	}

	dispatchParam(param: BaseParamType) {
		// if (param instanceof TypedMultipleParam) {
		// 	return new ParamMultipleJsonExporter(param);
		// }
		if (param instanceof TypedNumericParam) {
			return new ParamNumericJsonExporter(param);
		}
		// if (param instanceof OperatorPathParam) {
		// 	return new ParamOperatorPathJsonExporter(param);
		// }
		if (param instanceof NodePathParam) {
			return new ParamNodePathJsonExporter(param);
		}
		if (param instanceof ParamPathParam) {
			return new ParamParamPathJsonExporter(param);
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
