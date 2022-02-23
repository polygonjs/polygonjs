import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {FlockingGlNode} from '../../../src/engine/nodes/gl/Flocking';

const flockingGlNodePresetsCollectionFactory: PresetsCollectionFactory<FlockingGlNode> = (node: FlockingGlNode) => {
	const collection = new NodePresetsCollection();

	const position = new BasePreset().addEntry(node.p.positionAttribName, 'position');
	const instancePosition = new BasePreset().addEntry(node.p.positionAttribName, 'instancePosition');

	collection.setPresets({
		position,
		instancePosition,
	});

	return collection;
};
export const flockingGlPresetRegister: PresetRegister<typeof FlockingGlNode, FlockingGlNode> = {
	nodeClass: FlockingGlNode,
	setupFunc: flockingGlNodePresetsCollectionFactory,
};
