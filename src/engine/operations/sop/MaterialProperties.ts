import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Mesh, MeshBasicMaterial, Object3D} from 'three';
import {Material} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {updateMaterialSideWithShadow} from '../../nodes/mat/utils/helpers/MaterialSideHelper';
import {CoreMask} from '../../../core/geometry/Mask';
interface MaterialPropertiesSopParams extends DefaultOperationParams {
	group: string;
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
		group: '',
		applyToChildren: true,
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

	override cook(inputCoreGroups: CoreGroup[], params: MaterialPropertiesSopParams) {
		const coreGroup = inputCoreGroups[0];

		const selectedObjects = CoreMask.filterThreejsObjects(coreGroup, params);

		for (let selectedObject of selectedObjects) {
			this._updateObject(selectedObject, params);
		}
		return coreGroup;
	}
	private _updateObject(object: Object3D, params: MaterialPropertiesSopParams) {
		const material = (object as Mesh).material as Material | undefined;
		if (material) {
			this._updateMaterial(material, params);
		}
	}
	private _updateMaterial(material: Material, params: MaterialPropertiesSopParams) {
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
