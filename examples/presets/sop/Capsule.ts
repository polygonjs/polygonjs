import {CapsuleSopNode} from '../../../src/engine/nodes/sop/Capsule';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const capsuleSopNodePresetsCollectionFactory: PresetsCollectionFactory<CapsuleSopNode> = (node: CapsuleSopNode) => {
	const collection = new NodePresetsCollection();

	const playerControls = new BasePreset().addEntry(node.p.center, [0, `-(ch('height')*0.5 - ch('radius'))`, 0]);
	collection.setPresets({
		playerControls,
	});

	return collection;
};
export const capsuleSopPresetRegister: PresetRegister<typeof CapsuleSopNode, CapsuleSopNode> = {
	nodeClass: CapsuleSopNode,
	setupFunc: capsuleSopNodePresetsCollectionFactory,
};
