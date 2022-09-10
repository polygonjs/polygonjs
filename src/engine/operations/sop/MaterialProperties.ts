import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Mesh, MeshBasicMaterial} from 'three';
import {Material} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {updateMaterialSideWithShadow} from '../../nodes/mat/utils/helpers/MaterialSideHelper';
interface MaterialPropertiesSopParams extends DefaultOperationParams {
	applyToChildren: boolean;
	// side
	tside: boolean;
	doubleSided: boolean;
	front: boolean;
	overrideShadowSide: boolean;
	shadowDoubleSided: boolean;
	shadowFront: boolean;
	// wireframe
	twireframe: boolean;
	wireframe: boolean;
}

export class MaterialPropertiesSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: MaterialPropertiesSopParams = {
		applyToChildren: false,
		// side
		tside: false,
		doubleSided: false,
		front: true,
		overrideShadowSide: false,
		shadowDoubleSided: false,
		shadowFront: true,
		// wireframe
		twireframe: false,
		wireframe: false,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'materialProperties'> {
		return 'materialProperties';
	}

	override async cook(inputCoreGroups: CoreGroup[], params: MaterialPropertiesSopParams) {
		const coreGroup = inputCoreGroups[0];

		const objects: Mesh[] = [];
		for (let object of coreGroup.objects() as Mesh[]) {
			if (isBooleanTrue(params.applyToChildren)) {
				object.traverse((child) => {
					objects.push(child as Mesh);
				});
			} else {
				objects.push(object);
			}
		}
		for (let object of objects) {
			this._updateObject(object, params);
		}
		return coreGroup;
	}
	private _updateObject(object: Mesh, params: MaterialPropertiesSopParams) {
		const material = object.material as Material;
		if (material) {
			this._updateMaterial(material, params);
		}
	}
	private async _updateMaterial(material: Material, params: MaterialPropertiesSopParams) {
		if (isBooleanTrue(params.tside)) {
			updateMaterialSideWithShadow(material, params);
		}
		if (isBooleanTrue(params.twireframe)) {
			if ((material as MeshBasicMaterial).wireframe != undefined) {
				(material as MeshBasicMaterial).wireframe = params.wireframe;
			}
		}
	}
}
