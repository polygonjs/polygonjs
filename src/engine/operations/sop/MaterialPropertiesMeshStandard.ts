// import {BaseSopOperation} from './_Base';
// import {CoreGroup} from '../../../core/geometry/Group';
// import {Material, Mesh, Object3D} from 'three';
// import {InputCloneMode} from '../../poly/InputCloneMode';
// import {DefaultOperationParams} from '../../../core/operations/_Base';
// import {EnvMapOperationParams, ENV_MAP_OPERATION_DEFAULT_PARAMS} from '../../nodes/mat/utils/TextureEnvMapController';
// import {CoreMask} from '../../../core/geometry/Mask';
// import {
// 	MetalnessRoughnessOperationParams,
// 	METALNESS_ROUGHNESS_OPERATION_DEFAULT_PARAMS,
// } from '../../nodes/mat/utils/TextureMetalnessRoughnessMapController';

// interface MaterialPropertiesMeshStandardSopParams
// 	extends DefaultOperationParams,
// 		EnvMapOperationParams,
// 		MetalnessRoughnessOperationParams {
// 	group: string;
// 	applyToChildren: boolean;
// }

// export class MaterialPropertiesMeshStandardSopOperation extends BaseSopOperation {
// 	static override readonly DEFAULT_PARAMS: MaterialPropertiesMeshStandardSopParams = {
// 		group: '',
// 		applyToChildren: true,
// 		...ENV_MAP_OPERATION_DEFAULT_PARAMS,
// 		...METALNESS_ROUGHNESS_OPERATION_DEFAULT_PARAMS,
// 	};
// 	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
// 	static override type(): Readonly<'materialPropertiesMeshStandard'> {
// 		return 'materialPropertiesMeshStandard';
// 	}

// 	override async cook(inputCoreGroups: CoreGroup[], params: MaterialPropertiesMeshStandardSopParams) {
// 		const coreGroup = inputCoreGroups[0];

// 		const selectedObjects = CoreMask.filterObjects(coreGroup, params);

// 		for (let selectedObject of selectedObjects) {
// 			this._updateObject(selectedObject, params);
// 		}
// 		return coreGroup;
// 	}
// 	private _updateObject(object: Object3D, params: MaterialPropertiesMeshStandardSopParams) {
// 		const material = (object as Mesh).material as Material | undefined;
// 		if (material) {
// 			this._updateMaterial(material, params);
// 		}
// 	}
// 	private async _updateMaterial(material: Material, params: MaterialPropertiesMeshStandardSopParams) {
// 		// if (isBooleanTrue(params.tside)) {
// 		// 	updateMaterialSideWithShadow(material, params);
// 		// }
// 		// if (isBooleanTrue(params.twireframe)) {
// 		// 	if ((material as MeshBasicMaterial).wireframe != undefined) {
// 		// 		(material as MeshBasicMaterial).wireframe = params.wireframe;
// 		// 	}
// 		// }
// 		// TextureEnvMapController.updateMateria(material,params)
// 	}
// }
