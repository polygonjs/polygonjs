import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {isBooleanTrue} from '../../../core/Type';
import {Object3D} from 'three';

interface SetChildrenParams extends DefaultOperationParams {
	clearExistingChildren: boolean;
}

export class SetChildrenSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: SetChildrenParams = {
		clearExistingChildren: true,
	};
	static override readonly INPUT_CLONED_STATE = [InputCloneMode.FROM_NODE, InputCloneMode.FROM_NODE];
	static override type(): Readonly<'setChildren'> {
		return 'setChildren';
	}

	override cook(inputCoreGroups: CoreGroup[], params: SetChildrenParams) {
		const parentCoreGroup = inputCoreGroups[0];
		const childrenCoreGroup = inputCoreGroups[1];

		if (!childrenCoreGroup) {
			this.states?.error.set('input 1 is invalid');
			return this.createCoreGroupFromObjects([]);
		}

		const parentObjects = parentCoreGroup.objects();
		const parent = parentObjects[0];

		if (isBooleanTrue(params.clearExistingChildren)) {
			let child: Object3D | undefined;
			while ((child = parent.children[0])) {
				parent.remove(child);
			}
		}

		const childrenObjects = childrenCoreGroup.objects();
		for (let childObject of childrenObjects) {
			parent.add(childObject);
		}
		return this.createCoreGroupFromObjects(parentObjects);
	}
}
