/**
 * creates a rule that defines which tile can be next to the grid limit
 *
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {GRID_LIMIT_ID, ALL_HORIZONTAL_SIDES} from '../../../core/wfc/WFCCommon';
import {CoreWFCTileAttribute} from '../../../core/wfc/WFCAttributes';
import {WFCTilesCollection} from '../../../core/wfc/WFCTilesCollection';
import {createRuleObject} from '../../../core/wfc/WFCRule';

class WFCRuleGridLimitConnectionSopParamsConfig extends NodeParamsConfig {
	/** @param connect to unconnected sides */
	connectToUnconnectedSides = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new WFCRuleGridLimitConnectionSopParamsConfig();

export class WFCRuleGridLimitConnectionSopNode extends TypedSopNode<WFCRuleGridLimitConnectionSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.WFC_RULE_GRID_LIMIT_CONNECTION;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup0 = inputCoreGroups[0];
		// const coreGroup1 = inputCoreGroups[1];
		const tileAndRuleObjects = coreGroup0.threejsObjects();
		// const emptyTileObject = coreGroup1 ? coreGroup1.threejsObjects()[0] : null;
		// we add the empty tile here,
		// so that the iteration below takes it into account
		// and connects the empty tile to itself
		// const tileObject = emptyTileObject != null ? emptyTileObject : createDefaultEmptyTileObject();
		// addEmptyTileObjectAttributes(tileObject);
		// objects.push(tileObject);

		if (this.pv.connectToUnconnectedSides == true) {
			const collection = new WFCTilesCollection({tileAndRuleObjects});

			const srcTiles = collection.tiles();

			for (const srcTile of srcTiles) {
				const tileId = CoreWFCTileAttribute.getTileId(srcTile);
				collection.traverseUnconnectedSides(tileId, (sides) => {
					for (const side of sides) {
						tileAndRuleObjects.push(
							createRuleObject({
								id0: tileId,
								id1: GRID_LIMIT_ID,
								side0: side,
								side1: side == 'b' ? 't' : side == 't' ? 'b' : ALL_HORIZONTAL_SIDES,
							})
						);
					}
				});
			}
		}

		this.setObjects(tileAndRuleObjects);
	}
}
