/**
 * Assigns a material to be used by particles
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {ParticlesSystemGpuAttributesSopOperation} from '../../operations/sop/ParticlesSystemGpuAttributes';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = ParticlesSystemGpuAttributesSopOperation.DEFAULT_PARAMS;
class ParticlesSystemGpuAttributesSopParamsConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING(DEFAULT.group, {
		objectMask: true,
	});
	/** @param toggle on to also assign the material to children */
	applyToChildren = ParamConfig.BOOLEAN(DEFAULT.applyToChildren, {
		separatorAfter: true,
	});
}
const ParamsConfig = new ParticlesSystemGpuAttributesSopParamsConfig();

export class ParticlesSystemGpuAttributesSopNode extends TypedSopNode<ParticlesSystemGpuAttributesSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.PARTICLES_SYSTEM_GPU_ATTRIBUTES;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(ParticlesSystemGpuAttributesSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: ParticlesSystemGpuAttributesSopOperation | undefined;
	override async cook(inputCoreGroups: CoreGroup[]) {
		this._operation =
			this._operation || new ParticlesSystemGpuAttributesSopOperation(this._scene, this.states, this);
		const coreGroup = await this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
