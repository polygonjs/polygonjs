import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {NeighbourAttractRepulseGlNode} from '../../../src/engine/nodes/gl/NeighbourAttractRepulse';

const neighbourAttractRepulseGlNodePresetsCollectionFactory: PresetsCollectionFactory<NeighbourAttractRepulseGlNode> = (
	node: NeighbourAttractRepulseGlNode
) => {
	const collection = new NodePresetsCollection();

	const position = new BasePreset().addEntry(node.p.positionAttribName, 'position');
	const instancePosition = new BasePreset().addEntry(node.p.positionAttribName, 'instancePosition');

	collection.setPresets({
		position,
		instancePosition,
	});

	return collection;
};
export const neighbourAttractRepulseGlPresetRegister: PresetRegister<
	typeof NeighbourAttractRepulseGlNode,
	NeighbourAttractRepulseGlNode
> = {
	nodeClass: NeighbourAttractRepulseGlNode,
	setupFunc: neighbourAttractRepulseGlNodePresetsCollectionFactory,
};
