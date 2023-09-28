import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {WFCRuleFromSideNameSopNode} from '../../../src/engine/nodes/sop/WFCRuleFromSideName';
import {EMPTY_TILE_ID} from '../../../src/core/wfc/WFCCommon';

const WFCRuleFromSideNameSopNodePresetsCollectionFactory: PresetsCollectionFactory<WFCRuleFromSideNameSopNode> = (
	node: WFCRuleFromSideNameSopNode
) => {
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
export const WFCRuleFromSideNameSopPresetRegister: PresetRegister<
	typeof WFCRuleFromSideNameSopNode,
	WFCRuleFromSideNameSopNode
> = {
	nodeClass: WFCRuleFromSideNameSopNode,
	setupFunc: WFCRuleFromSideNameSopNodePresetsCollectionFactory,
};
