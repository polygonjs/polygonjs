import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CoreObject} from '../../../core/geometry/Object';
import {CameraAttribute} from '../../../core/camera/CoreCamera';
import {CameraSopNodeType} from '../../poly/NodeContext';
import {Object3D} from 'three';
import {CameraFrameMode, CAMERA_FRAME_MODES} from '../../../core/camera/CoreCameraFrameMode';

interface CameraFrameModeSopParams extends DefaultOperationParams {
	frameMode: number;
	expectedAspectRatio: number;
}
interface UpdateObjectOptions {
	objects: Object3D[];
	params: CameraFrameModeSopParams;
}

export class CameraFrameModeSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: CameraFrameModeSopParams = {
		frameMode: CAMERA_FRAME_MODES.indexOf(CameraFrameMode.DEFAULT),
		expectedAspectRatio: 16 / 9,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<CameraSopNodeType.FRAME_MODE> {
		return CameraSopNodeType.FRAME_MODE;
	}
	override cook(inputCoreGroups: CoreGroup[], params: CameraFrameModeSopParams) {
		const objects = inputCoreGroups[0].objects();

		if (this._node) {
			CameraFrameModeSopOperation.updateObject({objects, params});
		}

		return this.createCoreGroupFromObjects(objects);
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
