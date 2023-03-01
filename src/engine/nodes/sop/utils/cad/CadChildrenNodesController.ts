import {DisplayNodeControllerCallbacks} from '../../../utils/DisplayNodeController';
import {CadNetworkSopNode} from '../../CadNetwork';

export class CadChildrenDisplayController {
	_children_uuids_dict: Map<string, boolean> = new Map();
	_children_length: number = 0;

	constructor(private node: CadNetworkSopNode) {}

	displayNodeControllerCallbacks(): DisplayNodeControllerCallbacks {
		return {
			onDisplayNodeRemove: () => {
				this.node.setDirty();
			},
			onDisplayNodeSet: () => {
				this.node.setDirty();
			},
			onDisplayNodeUpdate: () => {
				this.node.setDirty();
			},
		};
	}
}
