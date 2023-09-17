import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {ThreejsCoreObject} from '../../../core/geometry/modules/three/ThreejsCoreObject';
import {CameraAttribute} from '../../../core/camera/CoreCamera';
import {CameraSopNodeType} from '../../poly/NodeContext';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
import {CoreMask} from '../../../core/geometry/Mask';

interface CameraViewerCodeSopParams extends DefaultOperationParams {
	group: string;
	viewerId: string;
	// shadowRoot: boolean;
	html: string;
}
interface UpdateObjectOptions {
	objects: ObjectContent<CoreObjectType>[];
	params: CameraViewerCodeSopParams;
}
export class CameraViewerCodeSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: CameraViewerCodeSopParams = {
		group: '',
		viewerId: 'my-viewer',
		// shadowRoot: true,
		html: '',
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<CameraSopNodeType.VIEWER_CODE> {
		return CameraSopNodeType.VIEWER_CODE;
	}
	override cook(inputCoreGroups: CoreGroup[], params: CameraViewerCodeSopParams) {
		const coreGroup = inputCoreGroups[0];
		const objects = CoreMask.filterObjects(coreGroup, {
			group: params.group,
		});

		if (this._node) {
			CameraViewerCodeSopOperation.updateObject({objects, params});
		}

		return coreGroup;
	}
	static updateObject(options: UpdateObjectOptions) {
		const {objects, params} = options;

		for (let object of objects) {
			ThreejsCoreObject.addAttribute(object, CameraAttribute.VIEWER_ID, params.viewerId);
			// CoreObject.addAttribute(object, CameraAttribute.VIEWER_SHADOW_ROOT, params.shadowRoot);
			ThreejsCoreObject.addAttribute(object, CameraAttribute.VIEWER_HTML, params.html);
		}
	}
}
