import {BaseSopNode} from '../_Base';

export class GroupParamController {
	static _add_group_param(node: BaseSopNode) {
		node.add_param(ParamType.STRING, 'group', '');
	}
}
