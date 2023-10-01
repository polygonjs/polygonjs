import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {BufferAttribute} from 'three';
import {BufferGeometry} from 'three';
import {DefaultOperationParams} from '../../../core/operations/_Base';
interface AttribAddMultSopParams extends DefaultOperationParams {
	name: string;
	preAdd: number;
	mult: number;
	postAdd: number;
}

export class AttribAddMultSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AttribAddMultSopParams = {
		name: '',
		preAdd: 0,
		mult: 1,
		postAdd: 0,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'attribAddMult'> {
		return 'attribAddMult';
	}

	override cook(inputCoreGroups: CoreGroup[], params: AttribAddMultSopParams) {
		const coreGroup = inputCoreGroups[0];
		const attribNames = coreGroup.pointAttribNamesMatchingMask(params.name);

		for (let attribName of attribNames) {
			const geometries = coreGroup.geometries();
			for (let geometry of geometries) {
				this._updateAttrib(attribName, geometry, params);
			}
		}

		return coreGroup;
	}
	private _updateAttrib(attribName: string, geometry: BufferGeometry, params: AttribAddMultSopParams) {
		const attribute = geometry.getAttribute(attribName) as BufferAttribute;
		if (attribute) {
			const values = attribute.array as number[];

			const preAdd = params.preAdd;
			const mult = params.mult;
			const postAdd = params.postAdd;
			for (let i = 0; i < values.length; i++) {
				const value = values[i];
				values[i] = (value + preAdd) * mult + postAdd;
			}
			// if (!this.io.inputs.clone_required(0)) {
			attribute.needsUpdate = true;
			// }
		}
	}
}
