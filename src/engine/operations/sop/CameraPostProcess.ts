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
import {Object3D} from 'three';

interface CameraPostProcessSopParams extends DefaultOperationParams {
	useOtherNode: boolean;
	node: TypedNodePathParamValue;
}
interface UpdateObjectOptions {
	objects: Object3D[];
	params: CameraPostProcessSopParams;
	node: BaseNodeType;
	active: boolean;
}

export class CameraPostProcessSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: CameraPostProcessSopParams = {
		useOtherNode: false,
		node: new TypedNodePathParamValue(''),
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<CameraSopNodeType.POST_PROCESS> {
		return CameraSopNodeType.POST_PROCESS;
	}
	override cook(inputCoreGroups: CoreGroup[], params: CameraPostProcessSopParams) {
		const objects = inputCoreGroups[0].objects();

		const relativeOrAbsolutePath = params.node.path();
		const node = isBooleanTrue(params.useOtherNode) ? this._node?.node(relativeOrAbsolutePath) : this._node;
		if (node) {
			// we need to give the absolute path, so that the creation of the viewer can find the node
			// without having to know which node set the path
			const absolutePath = node.path();
			for (let object of objects) {
				CoreObject.addAttribute(object, CameraAttribute.POST_PROCESS_PATH, absolutePath);
			}
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
				CoreObject.addAttribute(object, CameraAttribute.POST_PROCESS_PATH, absolutePath);
			}
		} else {
			for (let object of objects) {
				CoreObject.deleteAttribute(object, CameraAttribute.POST_PROCESS_PATH);
			}
		}
	}
}
