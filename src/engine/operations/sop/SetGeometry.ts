import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Mesh, BufferGeometry} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
interface SetGeometrySopParams extends DefaultOperationParams {}

export class SetGeometrySopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: SetGeometrySopParams = {};
	static override readonly INPUT_CLONED_STATE = [InputCloneMode.FROM_NODE, InputCloneMode.NEVER];
	static override type(): Readonly<'setGeometry'> {
		return 'setGeometry';
	}

	override cook(inputCoreGroups: CoreGroup[], params: SetGeometrySopParams) {
		const coreGroupDest = inputCoreGroups[0];
		const coreGroupSrc = inputCoreGroups[1];

		const destObjects = coreGroupDest.objects();
		const srcObjects = coreGroupSrc.objects();
		for (let i = 0; i < destObjects.length; i++) {
			const destObject = destObjects[i] as Mesh | undefined;
			const srcObject = srcObjects[i] as Mesh | undefined;

			if (destObject) {
				destObject.geometry = srcObject ? srcObject.geometry : SetGeometrySopOperation._emptyGeometry();
			}
		}

		return coreGroupDest;
	}

	private static __emptyGeometry: BufferGeometry | undefined;
	private static _emptyGeometry() {
		return (this.__emptyGeometry = this.__emptyGeometry || new BufferGeometry());
	}
}
