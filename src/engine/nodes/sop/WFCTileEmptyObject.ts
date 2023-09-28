/**
 * defines which object the WFCSolver will use as the empty tile
 *
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {createDefaultEmptyTileObject, addEmptyTileObjectAttributes} from '../../../core/wfc/WFCDebugTileObjects';

class WFCTileEmptyObjectSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new WFCTileEmptyObjectSopParamsConfig();

export class WFCTileEmptyObjectSopNode extends TypedSopNode<WFCTileEmptyObjectSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.WFC_TILE_EMPTY_OBJECT;
	}

	override initializeNode() {
		this.io.inputs.setCount(1, 2);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup0 = inputCoreGroups[0];
		const coreGroup1 = inputCoreGroups[1];
		const objects = coreGroup0.threejsObjects();
		const emptyTileObject = coreGroup1 ? coreGroup1.threejsObjects()[0] : null;

		const tileObject = emptyTileObject != null ? emptyTileObject : createDefaultEmptyTileObject();
		addEmptyTileObjectAttributes(tileObject);
		objects.push(tileObject);

		this.setObjects(objects);
	}
}
