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

class WFCTileUnresolvedObjectSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new WFCTileUnresolvedObjectSopParamsConfig();

export class WFCTileUnresolvedObjectSopNode extends TypedSopNode<WFCTileUnresolvedObjectSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.WFC_TILE_UNRESOLVED_OBJECT;
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 2);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup0 = inputCoreGroups[0];
		const coreGroup1 = inputCoreGroups[1];
		const inputObjects = coreGroup0 ? coreGroup0.allObjects() : [];
		const unresolvedTileObject = coreGroup1 ? coreGroup1.threejsObjects()[0] : null;

		const tileObject = unresolvedTileObject != null ? unresolvedTileObject : createDefaultUnresolvedTileObject();
		addUnresolvedTileObjectAttributes(tileObject);
		inputObjects.push(tileObject);

		this.setObjects(inputObjects);
	}
}
