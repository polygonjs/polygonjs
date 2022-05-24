import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Quaternion, Vector3} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CoreLookAt} from '../../../core/LookAt';

const q1 = new Quaternion();
const q2 = new Quaternion();

interface LookAtSopParams extends DefaultOperationParams {
	target: Vector3;
	up: Vector3;
	lerp: number;
	invertDirection: boolean;
}

export class LookAtSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: LookAtSopParams = {
		target: new Vector3(0, 0, 1),
		up: new Vector3(0, 1, 0),
		lerp: 1,
		invertDirection: false,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'lookAt'> {
		return 'lookAt';
	}

	override cook(inputCoreGroups: CoreGroup[], params: LookAtSopParams) {
		const objects = inputCoreGroups[0].objects();

		for (let object of objects) {
			object.up.copy(params.up);
			if (params.lerp >= 1) {
				CoreLookAt.applyLookAt(object, params.target, params.invertDirection);
			} else {
				q1.copy(object.quaternion);
				CoreLookAt.applyLookAt(object, params.target, params.invertDirection);
				q2.copy(object.quaternion);
				q1.slerp(q2, params.lerp);
				object.quaternion.copy(q1);
			}
			object.updateMatrix();
		}

		return inputCoreGroups[0];
	}
}
