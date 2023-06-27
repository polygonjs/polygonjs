import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CoreObject} from '../../../core/geometry/Object';
import {CameraAttribute} from '../../../core/camera/CoreCamera';
import {CameraSopNodeType} from '../../poly/NodeContext';
import {CameraFrameMode, CAMERA_FRAME_MODES} from '../../../core/camera/CoreCameraFrameMode';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
import {CoreMask} from '../../../core/geometry/Mask';

interface CameraFrameModeSopParams extends DefaultOperationParams {
	group: string;
	applyToChildren: boolean;
	frameMode: number;
	expectedAspectRatio: number;
}
interface UpdateObjectOptions {
	objects: ObjectContent<CoreObjectType>[];
	params: CameraFrameModeSopParams;
}

export class CameraFrameModeSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: CameraFrameModeSopParams = {
		group: '',
		applyToChildren: true,
		frameMode: CAMERA_FRAME_MODES.indexOf(CameraFrameMode.DEFAULT),
		expectedAspectRatio: 16 / 9,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<CameraSopNodeType.FRAME_MODE> {
		return CameraSopNodeType.FRAME_MODE;
	}
	override cook(inputCoreGroups: CoreGroup[], params: CameraFrameModeSopParams) {
		const coreGroup = inputCoreGroups[0];
		const objects = CoreMask.filterObjects(coreGroup, params);

		if (this._node) {
			CameraFrameModeSopOperation.updateObject({objects, params});
		}

		return coreGroup;
	}
	static updateObject(options: UpdateObjectOptions) {
		const {objects, params} = options;

		for (let object of objects) {
			CoreObject.addAttribute(object, CameraAttribute.FRAME_MODE, params.frameMode);
			CoreObject.addAttribute(
				object,
				CameraAttribute.FRAME_MODE_EXPECTED_ASPECT_RATIO,
				params.expectedAspectRatio
			);
		}
	}
}
