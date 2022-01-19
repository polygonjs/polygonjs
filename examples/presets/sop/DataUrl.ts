import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {DataUrlSopNode} from '../../../src/engine/nodes/sop/DataUrl';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

// export function DataUrlSopNodePresets() {
// 	return {
// 		basic: function (node: DataUrlSopNode) {
// 			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/nodes/sop/DataUrl/basic.json`);
// 		},
// 		default: function (node: DataUrlSopNode) {
// 			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/nodes/sop/DataUrl/default.json`);
// 		},
// 	};
// }

const dataUrlSopNodePresetsCollectionFactory: PresetsCollectionFactory<DataUrlSopNode> = (node: DataUrlSopNode) => {
	const collection = new NodePresetsCollection();

	const basic = new BasePreset().addEntry(node.p.url, `${DEMO_ASSETS_ROOT_URL}/nodes/sop/DataUrl/basic.json`);
	const defaultPreset = new BasePreset().addEntry(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/nodes/sop/DataUrl/default.json`
	);
	collection.setPresets({
		basic,
		default: defaultPreset,
	});

	return collection;
};
export const dataUrlSopPresetRegister: PresetRegister<typeof DataUrlSopNode, DataUrlSopNode> = {
	nodeClass: DataUrlSopNode,
	setupFunc: dataUrlSopNodePresetsCollectionFactory,
};
