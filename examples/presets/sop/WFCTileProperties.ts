import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {WFCTilePropertiesSopNode} from '../../../src/engine/nodes/sop/WFCTileProperties';

const WFCTilePropertiesSopNodePresetsCollectionFactory: PresetsCollectionFactory<WFCTilePropertiesSopNode> = (
	node: WFCTilePropertiesSopNode
) => {
	const collection = new NodePresetsCollection();

	collection.addPreset(
		`use object name`,
		new BasePreset().addEntry(node.p.addId, 1).addEntry(node.p.id, '`@objname`').addEntry(node.p.addName, 0)
	);

	return collection;
};
export const WFCTilePropertiesSopPresetRegister: PresetRegister<
	typeof WFCTilePropertiesSopNode,
	WFCTilePropertiesSopNode
> = {
	nodeClass: WFCTilePropertiesSopNode,
	setupFunc: WFCTilePropertiesSopNodePresetsCollectionFactory,
};
