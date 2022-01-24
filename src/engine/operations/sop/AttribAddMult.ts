import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
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

	override cook(input_contents: CoreGroup[], params: AttribAddMultSopParams) {
		const core_group = input_contents[0];
		const attrib_names = core_group.attribNamesMatchingMask(params.name);

		for (let attrib_name of attrib_names) {
			const geometries = core_group.geometries();
			for (let geometry of geometries) {
				this._update_attrib(attrib_name, geometry, params);
			}
		}

		return core_group;
	}
	private _update_attrib(attrib_name: string, geometry: BufferGeometry, params: AttribAddMultSopParams) {
		const attribute = geometry.getAttribute(attrib_name) as BufferAttribute;
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
