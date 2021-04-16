import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Object3D} from 'three/src/core/Object3D';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/BooleanValue';

interface ObjectPropertiesSopParams extends DefaultOperationParams {
	applyToChildren: boolean;
	// name
	tname: boolean;
	name: string;
	// renderOrder
	trenderOrder: boolean;
	renderOrder: number;
	// frustumCulled
	tfrustumCulled: boolean;
	frustumCulled: boolean;
	// matrixAutoUpdate
	tmatrixAutoUpdate: boolean;
	matrixAutoUpdate: boolean;
	// visible
	tvisible: boolean;
	visible: boolean;
	// castShadow
	tcastShadow: boolean;
	castShadow: boolean;
	// receiveShadow
	treceiveShadow: boolean;
	receiveShadow: boolean;
}

export class ObjectPropertiesSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: ObjectPropertiesSopParams = {
		applyToChildren: true,
		// name
		tname: false,
		name: '',
		// renderOrder
		trenderOrder: false,
		renderOrder: 0,
		// frustrumCulled
		tfrustumCulled: false,
		frustumCulled: true,
		// matrixAutoUpdate
		tmatrixAutoUpdate: false,
		matrixAutoUpdate: false,
		// visible
		tvisible: false,
		visible: true,
		// castShadow
		tcastShadow: false,
		castShadow: true,
		// receiveShadow
		treceiveShadow: false,
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
		if (isBooleanTrue(params.tname)) {
			object.name = params.name;
		}
		if (isBooleanTrue(params.trenderOrder)) {
			object.renderOrder = params.renderOrder;
		}
		if (isBooleanTrue(params.tfrustumCulled)) {
			object.frustumCulled = params.frustumCulled;
		}
		if (isBooleanTrue(params.tmatrixAutoUpdate)) {
			object.matrixAutoUpdate = params.matrixAutoUpdate;
		}
		if (isBooleanTrue(params.tvisible)) {
			object.visible = params.visible;
		}
		if (isBooleanTrue(params.tcastShadow)) {
			object.castShadow = params.castShadow;
		}
		if (isBooleanTrue(params.treceiveShadow)) {
			object.receiveShadow = params.receiveShadow;
		}
	}
}
