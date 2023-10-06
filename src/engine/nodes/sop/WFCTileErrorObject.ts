/**
 * creates an erro tile
 *
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {createDefaultErrorTileObject, addErrorTileObjectAttributes} from '../../../core/wfc/WFCDebugTileObjects';

class WFCTileErrorObjectSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new WFCTileErrorObjectSopParamsConfig();

export class WFCTileErrorObjectSopNode extends TypedSopNode<WFCTileErrorObjectSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.WFC_TILE_ERROR_OBJECT;
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 2);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup0 = inputCoreGroups[0];
		const coreGroup1 = inputCoreGroups[1];
		const objects = coreGroup0 ? coreGroup0.allObjects() : [];
		const errorTileObject = coreGroup1 ? coreGroup1.threejsObjects()[0] : null;

		const tileObject = errorTileObject != null ? errorTileObject : createDefaultErrorTileObject();
		addErrorTileObjectAttributes(tileObject);
		objects.push(tileObject);

		this.setObjects(objects);
	}
}
