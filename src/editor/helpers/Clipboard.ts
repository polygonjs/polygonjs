import {BaseNodeType} from 'src/engine/nodes/_Base';
import {BaseParamType} from 'src/engine/params/_Base';
import {StoreController} from '../store/controllers/StoreController';

export class ClipboardHelper {
	private static _copied_node: BaseNodeType;
	private static _copied_param: BaseParamType;
	constructor() {}

	static copy_node(node: BaseNodeType) {
		this._copied_node = node;
		this.copy(node.full_path());
		StoreController.editor.clipboard.set_node_id(node.graph_node_id);
	}
	static get copied_node() {
		return this._copied_node;
	}
	static copy_param(param: BaseParamType) {
		this._copied_param = param;
		this.copy(param.full_path());
		StoreController.editor.clipboard.set_param_id(param.graph_node_id);
	}
	static get copied_param() {
		return this._copied_param;
	}

	static copy(text: string) {
		const input = document.createElement('textarea');
		document.body.appendChild(input);
		input.value = text;
		input.select();
		document.execCommand('copy');
		document.body.removeChild(input);
	}

	// copy(text: string) {
	// 	ClipboardHelper.copy(text);
	// }
}
