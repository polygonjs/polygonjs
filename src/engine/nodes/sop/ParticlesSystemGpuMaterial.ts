/**
 * Assigns a material to be used by particles
 */
import {TypedSopNode} from './_Base';
import {NodeContext} from '../../poly/NodeContext';
import {CoreGroup} from '../../../core/geometry/Group';
import {ParticlesSystemGpuMaterialSopOperation} from '../../operations/sop/ParticlesSystemGpuMaterial';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = ParticlesSystemGpuMaterialSopOperation.DEFAULT_PARAMS;
class ParticlesSystemGpuMaterialSopParamsConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING(DEFAULT.group, {
		objectMask: true,
	});
	/** @param toggle on to also assign the material to children */
	applyToChildren = ParamConfig.BOOLEAN(DEFAULT.applyToChildren, {
		separatorAfter: true,
	});

	/** @param the material node */
	material = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.MAT,
		},
		dependentOnFoundNode: false,
		visibleIf: {assignMat: 1},
	});
}
const ParamsConfig = new ParticlesSystemGpuMaterialSopParamsConfig();

export class ParticlesSystemGpuMaterialSopNode extends TypedSopNode<ParticlesSystemGpuMaterialSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.PARTICLES_SYSTEM_GPU_MATERIAL;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(ParticlesSystemGpuMaterialSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: ParticlesSystemGpuMaterialSopOperation | undefined;
	override async cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new ParticlesSystemGpuMaterialSopOperation(this._scene, this.states, this);
		const coreGroup = await this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
