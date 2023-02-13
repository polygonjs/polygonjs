import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {VideoCopNode} from '../../../src/engine/nodes/cop/Video';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const videoCopNodePresetsCollectionFactory: PresetsCollectionFactory<VideoCopNode> = (node: VideoCopNode) => {
	const collection = new NodePresetsCollection();

	const blenderSintel = new BasePreset()
		.addEntry(node.p.urlsCount, 2)
		.addEntry(node.p.url1, `${DEMO_ASSETS_ROOT_URL}/textures/sintel.mp4`)
		.addEntry(node.p.url2, `${DEMO_ASSETS_ROOT_URL}/textures/sintel.ogv`);

	collection.setPresets({
		blenderSintel,
	});

	return collection;
};
export const videoCopPresetRegister: PresetRegister<typeof VideoCopNode, VideoCopNode> = {
	nodeClass: VideoCopNode,
	setupFunc: videoCopNodePresetsCollectionFactory,
};
