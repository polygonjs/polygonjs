/**
 * Converts InstancedMesh to Mesh
 *
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InstancedMeshToMeshSopOperation} from '../../operations/sop/InstancedMeshToMesh';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = InstancedMeshToMeshSopOperation.DEFAULT_PARAMS;
class InstancedMeshToMeshSopParamsConfig extends NodeParamsConfig {
	cloneGeometry = ParamConfig.BOOLEAN(DEFAULT.cloneGeometry);
}
const ParamsConfig = new InstancedMeshToMeshSopParamsConfig();

export class InstancedMeshToMeshSopNode extends TypedSopNode<InstancedMeshToMeshSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.INSTANCED_MESH_TO_MESH;
	}

	override initializeNode() {
		super.initializeNode();

		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InstancedMeshToMeshSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: InstancedMeshToMeshSopOperation | undefined;
	override async cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new InstancedMeshToMeshSopOperation(this.scene(), this.states, this);
		const coreGroup = await this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
