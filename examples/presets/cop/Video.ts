import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {VideoCopNode} from '../../../src/engine/nodes/cop/Video';
import {BasePreset, NodePresetsCollection, PresetsCollectionFactory} from '../BasePreset';

const videoCopNodePresetsCollectionFactory: PresetsCollectionFactory<VideoCopNode> = (node: VideoCopNode) => {
	const collection = new NodePresetsCollection();

	const ogv = new BasePreset().addEntry(node.p.url, `${DEMO_ASSETS_ROOT_URL}/textures/sintel.ogv`);
	const mp4 = new BasePreset().addEntry(node.p.url, `${DEMO_ASSETS_ROOT_URL}/textures/sintel.mp4`);

	collection.setPresets({
		ogv,
		mp4,
	});

	return collection;
};
export {VideoCopNode, videoCopNodePresetsCollectionFactory};
