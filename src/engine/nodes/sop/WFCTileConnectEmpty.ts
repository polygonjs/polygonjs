/**
 * creates connections with an empty tile
 *
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {EMPTY_TILE_ID, ALL_HORIZONTAL_SIDES} from '../../../core/wfc/WFCCommon';
import {CoreWFCTileAttribute} from '../../../core/wfc/WFCAttributes';
import {WFCTilesCollection} from '../../../core/wfc/WFCTilesCollection';
import {createConnectionObject} from '../../../core/wfc/WFCConnection';
import {EMPTY_TILE_OBJECT} from '../../../core/wfc/WFCDebugTileObjects';

class WFCTileConnectEmptySopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new WFCTileConnectEmptySopParamsConfig();

export class WFCTileConnectEmptySopNode extends TypedSopNode<WFCTileConnectEmptySopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.WFC_TILE_CONNECT_EMPTY;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup0 = inputCoreGroups[0];
		const objects = coreGroup0.threejsObjects();

		// we add the empty tile here,
		// so that the iteration below takes it into account
		// and connects the empty tile to itself
		objects.push(EMPTY_TILE_OBJECT.clone());

		const collection = new WFCTilesCollection(objects);

		const srcTiles = collection.tiles();

		for (const srcTile of srcTiles) {
			const tileId = CoreWFCTileAttribute.getTileId(srcTile);
			collection.traverseUnconnectedSides(tileId, (sides) => {
				console.log(tileId, sides);
				for (const side of sides) {
					objects.push(
						createConnectionObject({
							id0: tileId,
							id1: EMPTY_TILE_ID,
							side0: side,
							side1: side == 'b' ? 't' : side == 't' ? 'b' : ALL_HORIZONTAL_SIDES,
						})
					);
				}
			});
		}
		// connect to itself b/t
		objects.push(
			createConnectionObject({
				id0: EMPTY_TILE_ID,
				id1: EMPTY_TILE_ID,
				side0: 'b',
				side1: 't',
			})
		);

		this.setObjects(objects);
	}
}
