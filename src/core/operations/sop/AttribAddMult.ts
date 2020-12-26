import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
interface AttribAddMultSopParams extends DefaultOperationParams {
	name: string;
	pre_add: number;
	mult: number;
	post_add: number;
}

export class AttribAddMultSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: AttribAddMultSopParams = {
		name: '',
		pre_add: 0,
		mult: 1,
		post_add: 0,
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'attribAddMult'> {
		return 'attribAddMult';
	}

	cook(input_contents: CoreGroup[], params: AttribAddMultSopParams) {
		const core_group = input_contents[0];
		const attrib_names = core_group.attrib_names_matching_mask(params.name);

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

			const pre_add = params.pre_add;
			const mult = params.mult;
			const post_add = params.post_add;
			for (let i = 0; i < values.length; i++) {
				const value = values[i];
				values[i] = (value + pre_add) * mult + post_add;
			}
			// if (!this.io.inputs.clone_required(0)) {
			attribute.needsUpdate = true;
			// }
		}
	}
}
