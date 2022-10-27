import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {SDFFromUrlCopNode} from '../../../src/engine/nodes/cop/SDFFromUrl';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const SDFFromUrlCopNodePresetsCollectionFactory: PresetsCollectionFactory<SDFFromUrlCopNode> = (
	node: SDFFromUrlCopNode
) => {
	const collection = new NodePresetsCollection();

	function sdfMap() {
		const list = [
			'deer',
			'deer_head',
			'dolphin',
			'eagle',
			'einstein',
			'female-average-head',
			'gui_fradin',
			'horse_head',
			'male-average-head',
			'pan',
			'pan.high',
			'rhino.high',
			'rhino.low',
			'rhino.mid',
			'suzanne.high',
			'suzanne.mid',
			'wolf',
			'zenobia_in_chain',
		];

		const dict: Record<string, BasePreset> = {};
		for (let fileName of list) {
			const preset = new BasePreset().addEntry(node.p.url, `${DEMO_ASSETS_ROOT_URL}/models/sdf/${fileName}.bin`);
			dict[`${fileName}`] = preset;
		}
		return dict;
	}

	collection.setPresets({
		...sdfMap(),
	});

	return collection;
};
export const SDFFromUrlCopPresetRegister: PresetRegister<typeof SDFFromUrlCopNode, SDFFromUrlCopNode> = {
	nodeClass: SDFFromUrlCopNode,
	setupFunc: SDFFromUrlCopNodePresetsCollectionFactory,
};
