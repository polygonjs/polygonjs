import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {ImageEXRCopNode} from '../../../src/engine/nodes/cop/ImageEXR';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const imageEXRCopNodePresetsCollectionFactory: PresetsCollectionFactory<ImageEXRCopNode> = (node: ImageEXRCopNode) => {
	const collection = new NodePresetsCollection();

	function polyhavenEnvMaps() {
		const list = [
			'brown_photostudio_02_1k',
			'brown_photostudio_03_1k',
			'brown_photostudio_05_1k',
			'brown_photostudio_06_1k',
			'brown_photostudio_07_1k',
			'christmas_photo_studio_01_1k',
			'christmas_photo_studio_03_1k',
			'neon_photostudio_1k',
			'photo_studio_loft_hall_1k',
			'preller_drive_1k',
			'provence_studio_1k',
			'satara_night_1k',
			'studio_small_03_1k',
			'studio_small_07_1k',
			'studio_small_08_1k',
			'studio_small_09_1k',
		];

		const dict: Record<string, BasePreset> = {};
		for (let fileName of list) {
			const preset = new BasePreset()
				.addEntry(
					node.p.url,
					`${DEMO_ASSETS_ROOT_URL}/textures/resources/polyhaven.com/envmaps/${fileName}.exr`
				)
				.addEntry(node.p.tanisotropy, 1)
				.addEntry(node.p.useRendererMaxAnisotropy, 1)
				.addEntry(node.p.tminFilter, 1)
				.addEntry(node.p.tmagFilter, 1);
			dict[`polyhaven/${fileName}`] = preset;
		}
		return dict;
	}

	collection.setPresets({
		...polyhavenEnvMaps(),
	});

	return collection;
};
export const imageEXRCopPresetRegister: PresetRegister<typeof ImageEXRCopNode, ImageEXRCopNode> = {
	nodeClass: ImageEXRCopNode,
	setupFunc: imageEXRCopNodePresetsCollectionFactory,
};
