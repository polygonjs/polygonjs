import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Group, Vector2, Object3D, Mesh} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CoreMask} from '../../../core/geometry/Mask';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {textureFromAttributeSize} from '../../../core/geometry/operation/TextureFromAttribute';
import {coreParticlesInitParticlesUVs} from '../../../core/particles/CoreParticlesInit';

const _textureSize = new Vector2();

interface ParticlesSystemGpuAttributesSopParams extends DefaultOperationParams {
	group: string;
	applyToChildren: boolean;
}
// type TraverseCallback = (coreObject: CoreObject) => void;
export class ParticlesSystemGpuAttributesSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: ParticlesSystemGpuAttributesSopParams = {
		group: '',
		applyToChildren: true,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<SopType.PARTICLES_SYSTEM_GPU_ATTRIBUTES> {
		return SopType.PARTICLES_SYSTEM_GPU_ATTRIBUTES;
	}

	override cook(inputCoreGroups: CoreGroup[], params: ParticlesSystemGpuAttributesSopParams) {
		const coreGroup = inputCoreGroups[0];

		const selectedObjects = CoreMask.filterThreejsObjects(coreGroup, params);
		for (let selectedObject of selectedObjects) {
			this._applyAttributes(selectedObject, params);
		}

		return coreGroup;
	}

	private _applyAttributes(object: Object3D, params: ParticlesSystemGpuAttributesSopParams) {
		if ((object as Group).isGroup) {
			// do not assign material to a group, as this could cause render errors
			return;
		}
		const geometry = (object as Mesh).geometry;
		if (!geometry) {
			return;
		}

		textureFromAttributeSize(geometry, _textureSize);
		coreParticlesInitParticlesUVs(object, _textureSize);
	}
}
