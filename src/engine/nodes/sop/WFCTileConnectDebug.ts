/**
 * debugs the WFC tiles connections
 *
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InputCloneMode} from '../../poly/InputCloneMode';

class WFCTileConnectDebugSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new WFCTileConnectDebugSopParamsConfig();

export class WFCTileConnectDebugSopNode extends TypedSopNode<WFCTileConnectDebugSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.WFC_TILE_CONNECT_DEBUG;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		// const objects = coreGroup.allObjects();

		this.setCoreGroup(coreGroup);
	}
}
