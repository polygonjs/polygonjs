import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {TypedNodePathParamValue} from '../../../core/Walker';
import {CoreObject} from '../../../core/geometry/Object';
import {CameraAttribute} from '../../../core/camera/CoreCamera';
import {isBooleanTrue} from '../../../core/Type';
import {CameraSopNodeType} from '../../poly/NodeContext';
import {BaseNodeType} from '../../nodes/_Base';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
import {CoreMask} from '../../../core/geometry/Mask';

interface CameraPostProcessSopParams extends DefaultOperationParams {
	group: string;
	useOtherNode: boolean;
	node: TypedNodePathParamValue;
}
interface UpdateObjectOptions {
	objects: ObjectContent<CoreObjectType>[];
	params: CameraPostProcessSopParams;
	node: BaseNodeType;
	active: boolean;
}

export class CameraPostProcessSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: CameraPostProcessSopParams = {
		group: '',
		useOtherNode: false,
		node: new TypedNodePathParamValue(''),
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<CameraSopNodeType.POST_PROCESS> {
		return CameraSopNodeType.POST_PROCESS;
	}
	override cook(inputCoreGroups: CoreGroup[], params: CameraPostProcessSopParams) {
		const coreGroup = inputCoreGroups[0];
		const objects = CoreMask.filterObjects(coreGroup, {
			group: params.group,
		});

		const relativeOrAbsolutePath = params.node.path();
		const node = isBooleanTrue(params.useOtherNode) ? this._node?.node(relativeOrAbsolutePath) : this._node;
		if (node) {
			const nodeId = node.graphNodeId();
			for (let object of objects) {
				CoreObject.addAttribute(object, CameraAttribute.POST_PROCESS_NODE_ID, nodeId);
			}
		}

		return coreGroup;
	}
	static updateObject(options: UpdateObjectOptions) {
		const {objects, params, node, active} = options;
		const relativeOrAbsolutePath = params.node.path();
		const foundNode = node.node(relativeOrAbsolutePath);
		if (foundNode && active) {
			// see CameraControls for why this method of storing the node is preferable
			const nodeId = foundNode.graphNodeId();
			for (let object of objects) {
				CoreObject.addAttribute(object, CameraAttribute.POST_PROCESS_NODE_ID, nodeId);
			}
		} else {
			for (let object of objects) {
				CoreObject.deleteAttribute(object, CameraAttribute.POST_PROCESS_NODE_ID);
			}
		}
	}
}
