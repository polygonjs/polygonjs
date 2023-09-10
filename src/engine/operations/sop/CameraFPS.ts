import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CoreObject} from '../../../core/geometry/modules/three/CoreObject';
import {CameraAttribute} from '../../../core/camera/CoreCamera';
import {CameraSopNodeType} from '../../poly/NodeContext';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
import {CoreMask} from '../../../core/geometry/Mask';

interface CameraFPSSopParams extends DefaultOperationParams {
	group: string;
	maxFPS: number;
	allowDynamicChange: boolean;
}
interface UpdateObjectOptions {
	objects: ObjectContent<CoreObjectType>[];
	params: CameraFPSSopParams;
}

export class CameraFPSSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: CameraFPSSopParams = {
		group: '',
		maxFPS: 60,
		allowDynamicChange: false,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<CameraSopNodeType.FPS> {
		return CameraSopNodeType.FPS;
	}
	override cook(inputCoreGroups: CoreGroup[], params: CameraFPSSopParams) {
		const coreGroup = inputCoreGroups[0];
		const objects = CoreMask.filterObjects(coreGroup, {
			group: params.group,
		});

		if (this._node) {
			CameraFPSSopOperation.updateObject({objects, params});
		}

		return coreGroup;
	}
	static updateObject(options: UpdateObjectOptions) {
		const {objects, params} = options;

		for (let object of objects) {
			CoreObject.addAttribute(object, CameraAttribute.MAX_FPS, params.maxFPS);
			CoreObject.addAttribute(object, CameraAttribute.MAX_FPS_DYNAMIC_CHANGE, params.allowDynamicChange);
		}
	}
}
