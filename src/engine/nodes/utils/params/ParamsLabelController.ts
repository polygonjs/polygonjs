import {BaseParamType} from '../../../params/_Base';
import {ParamType} from '../../../poly/ParamType';
import {StringParam} from '../../../params/String';

type LabelControllerCallback = () => string;

export class ParamsLabelController {
	private _callback: LabelControllerCallback | undefined;
	private _params: BaseParamType[] | undefined;
	// private _graph_node: CoreGraphNode | undefined;
	constructor() {}

	params() {
		return this._params;
	}
	callback() {
		return this._callback;
	}

	init(params: BaseParamType[], callback?: LabelControllerCallback) {
		this._params = params;
		if (callback) {
			this._callback = callback;
		} else {
			const param = this._params[0];
			if (param.type == ParamType.STRING) {
				const string_param = param as StringParam;
				this._callback = () => {
					return string_param.value;
				};
			}
		}
		// this.graph_node.add_graph_input(this._param, false);
	}

	// set_callback(params: BaseParamType[], callback: LabelControllerCallback) {
	// 	// for (let param of params) {
	// 	// 	this.graph_node.add_graph_input(param, false);
	// 	// }
	// 	this._params = params
	// 	this._callback = callback;
	// }

	// private get graph_node() {
	// 	return (this._graph_node = this._graph_node || this._create_graph_node());
	// }
	// private _create_graph_node() {
	// 	const graph_node = new CoreGraphNode(this.params_controller.node.scene, 'ParamsLabelController');
	// 	graph_node.add_post_dirty_hook('update_param_label', () => {
	// 		console.log('dirty');
	// 		if (this._callback) {
	// 			console.log(this._callback());
	// 		}
	// 	});
	// 	return graph_node;
	// }
}
