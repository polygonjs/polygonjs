import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CoreObject} from '../../../core/geometry/Object';
import {CameraAttribute} from '../../../core/camera/CoreCamera';
import {CameraSopNodeType} from '../../poly/NodeContext';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
import {CoreMask} from '../../../core/geometry/Mask';
import {Vector2} from 'three';

interface CameraViewOffsetSopParams extends DefaultOperationParams {
	group: string;
	min: Vector2;
	max: Vector2;
}
interface UpdateObjectOptions {
	objects: ObjectContent<CoreObjectType>[];
	params: CameraViewOffsetSopParams;
}

export class CameraViewOffsetSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: CameraViewOffsetSopParams = {
		group: '',
		min: new Vector2(0, 0),
		max: new Vector2(1, 1),
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<CameraSopNodeType.VIEW_OFFSET> {
		return CameraSopNodeType.VIEW_OFFSET;
	}
	override cook(inputCoreGroups: CoreGroup[], params: CameraViewOffsetSopParams) {
		const coreGroup = inputCoreGroups[0];
		const objects = CoreMask.filterObjects(coreGroup, {
			group: params.group,
		});

		if (this._node) {
			CameraViewOffsetSopOperation.updateObject({objects, params});
		}

		return coreGroup;
	}
	static updateObject(options: UpdateObjectOptions) {
		const {objects, params} = options;

		for (let object of objects) {
			CoreObject.addAttribute(object, CameraAttribute.VIEW_OFFSET_MIN, params.min);
			CoreObject.addAttribute(object, CameraAttribute.VIEW_OFFSET_MAX, params.max);
		}
	}
}
