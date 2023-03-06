import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {TypedNodePathParamValue} from '../../../core/Walker';
import {CoreObject} from '../../../core/geometry/Object';
import {CameraAttribute} from '../../../core/camera/CoreCamera';
import {CameraSopNodeType} from '../../poly/NodeContext';
import {Object3D} from 'three';
import {BaseNodeType} from '../../nodes/_Base';

interface CameraRenderSceneSopParams extends DefaultOperationParams {
	node: TypedNodePathParamValue;
}
interface UpdateObjectOptions {
	objects: Object3D[];
	params: CameraRenderSceneSopParams;
	node: BaseNodeType;
	active: boolean;
}

export class CameraRenderSceneSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: CameraRenderSceneSopParams = {
		node: new TypedNodePathParamValue(''),
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<CameraSopNodeType.RENDER_SCENE> {
		return CameraSopNodeType.RENDER_SCENE;
	}
	override cook(inputCoreGroups: CoreGroup[], params: CameraRenderSceneSopParams) {
		const objects = inputCoreGroups[0].threejsObjects();

		if (this._node) {
			CameraRenderSceneSopOperation.updateObject({objects, params, node: this._node, active: true});
		}

		return this.createCoreGroupFromObjects(objects);
	}
	static updateObject(options: UpdateObjectOptions) {
		const {objects, params, node, active} = options;

		const relativeOrAbsolutePath = params.node.path();
		const foundNode = node.node(relativeOrAbsolutePath);
		if (foundNode && active) {
			// see CameraControls for why this method of storing the node is preferable
			const nodeId = foundNode.graphNodeId();
			for (let object of objects) {
				CoreObject.addAttribute(object, CameraAttribute.RENDER_SCENE_NODE_ID, nodeId);
			}
		} else {
			for (let object of objects) {
				CoreObject.deleteAttribute(object, CameraAttribute.RENDER_SCENE_NODE_ID);
			}
		}
	}
}
