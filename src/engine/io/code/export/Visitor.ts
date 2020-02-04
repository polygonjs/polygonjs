import {BaseNode} from 'src/Engine/Node/_Base';
import {BaseParam} from 'src/Engine/Param/_Base';

import {NodeCodeExporter} from './Node';
import {BaseNodeObjCodeExporter} from './Node/Obj';
import {BaseNodeSopSubnetworkCodeExporter} from './Node/Subnetwork';

import {ParamCodeExporter} from './Param';
import {ParamMultipleCodeExporter} from './Param/Multiple';
import {ParamNumericCodeExporter} from './Param/Numeric';
import {ParamOperatorPathCodeExporter} from './Param/OperatorPath';
import {ParamStringCodeExporter} from './Param/String';
import {ParamRampCodeExporter} from './Param/Ramp';

export class CodeExporterVisitor {
	static node(node: BaseNode): NodeCodeExporter {
		return new NodeCodeExporter(node);
	}
	static node_obj(node: BaseNode) {
		return new BaseNodeObjCodeExporter(node);
	}
	static node_sop_subnetwork(node: BaseNode) {
		return new BaseNodeSopSubnetworkCodeExporter(node);
	}

	static visit_param(param: BaseParam) {
		return new ParamCodeExporter(param);
	}
	static param_multiple(param: BaseParam) {
		return new ParamMultipleCodeExporter(param);
	}
	static param_numeric(param: BaseParam) {
		return new ParamNumericCodeExporter(param);
	}
	static param_operator_path(param: BaseParam) {
		return new ParamOperatorPathCodeExporter(param);
	}
	static param_string(param: BaseParam) {
		return new ParamStringCodeExporter(param);
	}
	static param_ramp(param: BaseParam) {
		return new ParamRampCodeExporter(param);
	}
}
