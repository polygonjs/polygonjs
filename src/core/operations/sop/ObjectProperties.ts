import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../geometry/Group';
import {Object3D} from 'three/src/core/Object3D';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';

interface ObjectPropertiesSopParams extends DefaultOperationParams {
	applyToChildren: boolean;
	tname: boolean;
	name: string;
	trenderOrder: boolean;
	renderOrder: number;
	frustumCulled: boolean;
	matrixAutoUpdate: boolean;
	visible: boolean;
	castShadow: boolean;
	receiveShadow: boolean;
}

export class ObjectPropertiesSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: ObjectPropertiesSopParams = {
		applyToChildren: false,
		tname: false,
		name: '',
		trenderOrder: false,
		renderOrder: 0,
		frustumCulled: true,
		matrixAutoUpdate: false,
		visible: true,
		castShadow: true,
		receiveShadow: true,
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'objectProperties'> {
		return 'objectProperties';
	}

	cook(input_contents: CoreGroup[], params: ObjectPropertiesSopParams) {
		const core_group = input_contents[0];

		for (let object of core_group.objects()) {
			if (params.applyToChildren) {
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
		if (params.trenderOrder) {
			object.renderOrder = params.renderOrder;
		}
		object.frustumCulled = params.frustumCulled;
		object.matrixAutoUpdate = params.matrixAutoUpdate;
		object.visible = params.visible;
		object.castShadow = params.castShadow;
		object.receiveShadow = params.receiveShadow;
	}
}
