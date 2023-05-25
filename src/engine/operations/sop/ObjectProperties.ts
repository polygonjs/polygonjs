import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';

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
	static override readonly DEFAULT_PARAMS: ObjectPropertiesSopParams = {
		applyToChildren: false,
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
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'objectProperties'> {
		return 'objectProperties';
	}

	override cook(inputCoreGroups: CoreGroup[], params: ObjectPropertiesSopParams) {
		const coreGroup = inputCoreGroups[0];

		const objects = coreGroup.allObjects();
		for (let object of objects) {
			if (isBooleanTrue(params.applyToChildren)) {
				object.traverse((child) => {
					this._updateObject(child, params);
				});
			} else {
				this._updateObject(object, params);
			}
		}

		return coreGroup;
	}
	private _updateObject<T extends CoreObjectType>(object: ObjectContent<T>, params: ObjectPropertiesSopParams) {
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
