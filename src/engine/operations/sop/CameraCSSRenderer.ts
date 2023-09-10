import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {TypedNodePathParamValue} from '../../../core/Walker';
import {CoreObject} from '../../../core/geometry/modules/three/CoreObject';
import {CameraAttribute} from '../../../core/camera/CoreCamera';
import {CameraSopNodeType} from '../../poly/NodeContext';
import {BaseNodeType} from '../../nodes/_Base';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
import {CoreMask} from '../../../core/geometry/Mask';

interface CameraCSSRendererSopParams extends DefaultOperationParams {
	group: string;
	node: TypedNodePathParamValue;
}
interface UpdateObjectOptions {
	objects: ObjectContent<CoreObjectType>[];
	params: CameraCSSRendererSopParams;
	node: BaseNodeType;
	active: boolean;
}

export class CameraCSSRendererSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: CameraCSSRendererSopParams = {
		group: '',
		node: new TypedNodePathParamValue(''),
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<CameraSopNodeType.CSS_RENDERER> {
		return CameraSopNodeType.CSS_RENDERER;
	}
	override cook(inputCoreGroups: CoreGroup[], params: CameraCSSRendererSopParams) {
		const coreGroup = inputCoreGroups[0];
		const objects = CoreMask.filterObjects(coreGroup, {
			group: params.group,
		});

		if (this._node) {
			CameraCSSRendererSopOperation.updateObject({objects, params, node: this._node, active: true});
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
				CoreObject.addAttribute(object, CameraAttribute.CSS_RENDERER_NODE_ID, nodeId);
			}
		} else {
			for (let object of objects) {
				CoreObject.deleteAttribute(object, CameraAttribute.CSS_RENDERER_NODE_ID);
			}
		}
	}
}
