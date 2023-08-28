/**
 * creates a tile for the unresolved cells
 *
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {
	createDefaultUnresolvedTileObject,
	addUnresolvedTileObjectAttributes,
} from '../../../core/wfc/WFCDebugTileObjects';

class WFCUnresolvedTileSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new WFCUnresolvedTileSopParamsConfig();

export class WFCUnresolvedTileSopNode extends TypedSopNode<WFCUnresolvedTileSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.WFC_UNRESOLVED_TILE;
	}

	override initializeNode() {
		this.io.inputs.setCount(1, 2);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup0 = inputCoreGroups[0];
		const coreGroup1 = inputCoreGroups[1];
		const objects = coreGroup0.threejsObjects();
		const unresolvedTileObject = coreGroup1 ? coreGroup1.threejsObjects()[0] : null;

		const tileObject = unresolvedTileObject != null ? unresolvedTileObject : createDefaultUnresolvedTileObject();
		addUnresolvedTileObjectAttributes(tileObject);
		objects.push(tileObject);

		this.setObjects(objects);
	}
}
