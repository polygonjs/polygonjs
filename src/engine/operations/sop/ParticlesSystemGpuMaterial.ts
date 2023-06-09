import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {TypedNodePathParamValue} from '../../../core/Walker';
import {NodeContext} from '../../../engine/poly/NodeContext';
import {CoreMaterial} from '../../../core/geometry/Material';
import {Group, Material, Object3D, Mesh} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CoreMask} from '../../../core/geometry/Mask';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CoreParticlesAttribute} from '../../../core/particles/CoreParticlesAttribute';
import {BaseMatNodeType} from '../../nodes/mat/_Base';

interface MaterialAndNode {
	material: Material;
	materialNode: BaseMatNodeType;
}

interface ParticlesSystemGpuMaterialSopParams extends DefaultOperationParams {
	group: string;
	applyToChildren: boolean;
	material: TypedNodePathParamValue;
}
// type TraverseCallback = (coreObject: CoreObject) => void;
export class ParticlesSystemGpuMaterialSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: ParticlesSystemGpuMaterialSopParams = {
		group: '',
		applyToChildren: true,
		material: new TypedNodePathParamValue(''),
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<SopType.PARTICLES_SYSTEM_GPU_MATERIAL> {
		return SopType.PARTICLES_SYSTEM_GPU_MATERIAL;
	}

	override async cook(inputCoreGroups: CoreGroup[], params: ParticlesSystemGpuMaterialSopParams) {
		const coreGroup = inputCoreGroups[0];
		await this._applyMaterials(coreGroup, params);
		return coreGroup;
	}

	private async _getMaterial(params: ParticlesSystemGpuMaterialSopParams): Promise<MaterialAndNode | undefined> {
		const materialNode = params.material.nodeWithContext(NodeContext.MAT, this.states?.error);
		if (materialNode) {
			const material = await materialNode.material();

			if (!material) {
				this.states?.error.set(`material invalid. (error: '${materialNode.states.error.message()}')`);
				return;
			}

			return {material, materialNode};
		} else {
			this.states?.error.set(`no material node found`);
		}
	}

	private async _applyMaterials(coreGroup: CoreGroup, params: ParticlesSystemGpuMaterialSopParams) {
		const materialData = await this._getMaterial(params);
		if (!materialData) {
			return;
		}

		const selectedObjects = CoreMask.filterThreejsObjects(coreGroup, params);

		for (let selectedObject of selectedObjects) {
			this._applyMaterial(selectedObject, materialData, params);
		}

		return coreGroup;
	}

	private _applyMaterial(
		object: Object3D,
		materialData: MaterialAndNode,
		params: ParticlesSystemGpuMaterialSopParams
	) {
		if ((object as Group).isGroup) {
			// do not assign material to a group, as this could cause render errors
			return;
		}

		const objectWithmaterial = object as Mesh;
		// const current_mat = object_with_material.material as Material | undefined;
		// if (current_mat && params.swapCurrentTex) {
		// 	this._swap_texture(used_material, current_mat, params);
		// }
		objectWithmaterial.material = materialData.material;
		CoreParticlesAttribute.setMaterialNodeId(object, materialData.materialNode.graphNodeId());

		CoreMaterial.applyRenderHook(object, materialData.material);
		CoreMaterial.applyCustomMaterials(object, materialData.material);
	}
}
