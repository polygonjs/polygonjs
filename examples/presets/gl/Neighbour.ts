import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {NeighbourAttractGlNode} from '../../../src/engine/nodes/gl/NeighbourAttract';
import {NeighbourRepulseGlNode} from '../../../src/engine/nodes/gl/NeighbourRepulse';

type NeighbourGlNode = NeighbourAttractGlNode | NeighbourRepulseGlNode;

const neighbourGlNodePresetsCollectionFactory: PresetsCollectionFactory<NeighbourGlNode> = (node: NeighbourGlNode) => {
	const collection = new NodePresetsCollection();

	const position = new BasePreset().addEntry(node.p.positionAttribName, 'position');
	const instancePosition = new BasePreset().addEntry(node.p.positionAttribName, 'instancePosition');

	collection.setPresets({
		position,
		instancePosition,
	});

	return collection;
};
export const neighbourAttractGlPresetRegister: PresetRegister<typeof NeighbourAttractGlNode, NeighbourAttractGlNode> = {
	nodeClass: NeighbourAttractGlNode,
	setupFunc: neighbourGlNodePresetsCollectionFactory,
};
export const neighbourRepulseGlPresetRegister: PresetRegister<typeof NeighbourRepulseGlNode, NeighbourRepulseGlNode> = {
	nodeClass: NeighbourRepulseGlNode,
	setupFunc: neighbourGlNodePresetsCollectionFactory,
};
