import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {TypedNodePathParamValue} from '../../../core/Walker';
import {CoreObject} from '../../../core/geometry/Object';
import {CameraAttribute} from '../../../core/camera/CoreCamera';
import {CameraSopNodeType} from '../../poly/NodeContext';
import {BaseNodeType} from '../../nodes/_Base';
import {Object3D} from 'three';

interface CameraRendererSopParams extends DefaultOperationParams {
	node: TypedNodePathParamValue;
}
interface UpdateObjectOptions {
	objects: Object3D[];
	params: CameraRendererSopParams;
	node: BaseNodeType;
	active: boolean;
}

export class CameraRendererSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: CameraRendererSopParams = {
		node: new TypedNodePathParamValue(''),
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<CameraSopNodeType.RENDERER> {
		return CameraSopNodeType.RENDERER;
	}
	override cook(inputCoreGroups: CoreGroup[], params: CameraRendererSopParams) {
		const objects = inputCoreGroups[0].objects();

		if (this._node) {
			CameraRendererSopOperation.updateObject({objects, params, node: this._node, active: true});
		}

		return this.createCoreGroupFromObjects(objects);
	}
	static updateObject(options: UpdateObjectOptions) {
		const {objects, params, node, active} = options;
		const relativeOrAbsolutePath = params.node.path();
		const foundNode = node.node(relativeOrAbsolutePath);
		if (foundNode && active) {
			// we need to give the absolute path, so that the creation of the viewer can find the node
			// without having to know which node set the path
			const absolutePath = foundNode.path();
			for (let object of objects) {
				CoreObject.addAttribute(object, CameraAttribute.RENDERER_PATH, absolutePath);
			}
		} else {
			for (let object of objects) {
				CoreObject.deleteAttribute(object, CameraAttribute.RENDERER_PATH);
			}
		}
	}
}
