import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {WFCTileSideNameSopNode} from '../../../src/engine/nodes/sop/WFCTileSideName';
import {EMPTY_SIDE_NAME} from '../../../src/core/wfc/WFCConstant';

const WFCTileSideNameSopNodePresetsCollectionFactory: PresetsCollectionFactory<WFCTileSideNameSopNode> = (
	node: WFCTileSideNameSopNode
) => {
	const collection = new NodePresetsCollection();

	collection.addPreset(`empty`, new BasePreset().addEntry(node.p.sideName, EMPTY_SIDE_NAME));

	return collection;
};
export const WFCTileSideNameSopPresetRegister: PresetRegister<typeof WFCTileSideNameSopNode, WFCTileSideNameSopNode> = {
	nodeClass: WFCTileSideNameSopNode,
	setupFunc: WFCTileSideNameSopNodePresetsCollectionFactory,
};
