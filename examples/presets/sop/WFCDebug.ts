import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {WFCDebugSopNode} from '../../../src/engine/nodes/sop/WFCDebug';
import {EMPTY_TILE_ID} from '../../../src/core/wfc/WFCConstant';

const WFCDebugSopNodePresetsCollectionFactory: PresetsCollectionFactory<WFCDebugSopNode> = (node: WFCDebugSopNode) => {
	const collection = new NodePresetsCollection();

	collection.addPreset(
		`all to all`,
		new BasePreset().addEntry(node.p.srcTileId, '*').addEntry(node.p.destTileId, '*')
	);
	collection.addPreset(
		`all to all (except empty tile)`,
		new BasePreset()
			.addEntry(node.p.srcTileId, `* ^${EMPTY_TILE_ID}`)
			.addEntry(node.p.destTileId, `* ^${EMPTY_TILE_ID}`)
	);
	collection.addPreset(
		`t0 to all`,
		new BasePreset().addEntry(node.p.srcTileId, 't0').addEntry(node.p.destTileId, '*')
	);
	collection.addPreset(
		`t0 to empty tile`,
		new BasePreset().addEntry(node.p.srcTileId, 't0').addEntry(node.p.destTileId, EMPTY_TILE_ID)
	);
	collection.addPreset(
		`t0 to all (except empty tile)`,
		new BasePreset().addEntry(node.p.srcTileId, 't0').addEntry(node.p.destTileId, `* ^${EMPTY_TILE_ID}`)
	);

	return collection;
};
export const WFCDebugSopPresetRegister: PresetRegister<typeof WFCDebugSopNode, WFCDebugSopNode> = {
	nodeClass: WFCDebugSopNode,
	setupFunc: WFCDebugSopNodePresetsCollectionFactory,
};
