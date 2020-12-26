import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../geometry/Group';
import {Object3D} from 'three/src/core/Object3D';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';

interface ObjectPropertiesSopParams extends DefaultOperationParams {
	apply_to_children: boolean;
	tname: boolean;
	name: string;
	trender_order: boolean;
	render_order: number;
	frustrum_culled: boolean;
	matrix_auto_update: boolean;
	visible: boolean;
	cast_shadow: boolean;
	receive_shadow: boolean;
}

export class ObjectPropertiesSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: ObjectPropertiesSopParams = {
		apply_to_children: false,
		tname: false,
		name: '',
		trender_order: false,
		render_order: 0,
		frustrum_culled: true,
		matrix_auto_update: false,
		visible: true,
		cast_shadow: true,
		receive_shadow: true,
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'objectProperties'> {
		return 'objectProperties';
	}

	cook(input_contents: CoreGroup[], params: ObjectPropertiesSopParams) {
		const core_group = input_contents[0];

		for (let object of core_group.objects()) {
			if (params.apply_to_children) {
				object.traverse((child) => {
					this._update_object(child, params);
				});
			} else {
				this._update_object(object, params);
			}
		}

		return core_group;
	}
	private _update_object(object: Object3D, params: ObjectPropertiesSopParams) {
		if (params.tname) {
			object.name = params.name;
		}
		if (params.trender_order) {
			object.renderOrder = params.render_order;
		}
		object.frustumCulled = params.frustrum_culled;
		object.matrixAutoUpdate = params.matrix_auto_update;
		object.visible = params.visible;
		object.castShadow = params.cast_shadow;
		object.receiveShadow = params.receive_shadow;
	}
}
