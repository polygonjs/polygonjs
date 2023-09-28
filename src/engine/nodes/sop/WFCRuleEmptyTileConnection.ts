/**
 * creates an empty tile, as well as connections to it
 *
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {EMPTY_TILE_ID, ALL_HORIZONTAL_SIDES} from '../../../core/wfc/WFCCommon';
import {CoreWFCTileAttribute} from '../../../core/wfc/WFCAttributes';
import {WFCTilesCollection} from '../../../core/wfc/WFCTilesCollection';
import {createRuleObject} from '../../../core/wfc/WFCRule';

class WFCRuleEmptyTileConnectionSopParamsConfig extends NodeParamsConfig {
	/** @param connect to unconnected sides */
	connectToUnconnectedSides = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new WFCRuleEmptyTileConnectionSopParamsConfig();

export class WFCRuleEmptyTileConnectionSopNode extends TypedSopNode<WFCRuleEmptyTileConnectionSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.WFC_RULE_EMPTY_TILE_CONNECTION;
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
								id1: EMPTY_TILE_ID,
								side0: side,
								side1: side == 'b' ? 't' : side == 't' ? 'b' : ALL_HORIZONTAL_SIDES,
							})
						);
					}
				});
			}
		}

		// connect empty tile to itself b/t
		tileAndRuleObjects.push(
			createRuleObject({
				id0: EMPTY_TILE_ID,
				id1: EMPTY_TILE_ID,
				side0: 'b',
				side1: 't',
			})
		);

		this.setObjects(tileAndRuleObjects);
	}
}
