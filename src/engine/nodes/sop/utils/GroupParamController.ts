import {BaseSopNode} from '../_Base';
import {ParamType} from 'src/engine/poly/ParamType';

export class GroupParamController {
	static add_param(node: BaseSopNode) {
		node.add_param(ParamType.STRING, 'group', '');
	}
}
