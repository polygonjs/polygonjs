import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {ImageCopNode} from '../../../src/engine/nodes/cop/Image';
import {BasePreset, NodePresetsCollection, PresetsCollectionFactory} from '../BasePreset';

const imageCopNodePresetsCollectionFactory: PresetsCollectionFactory<ImageCopNode> = (node: ImageCopNode) => {
	const collection = new NodePresetsCollection();

	const asphalt = new BasePreset().addEntry(node.p.url, `${DEMO_ASSETS_ROOT_URL}/textures/asphalt.jpg`);
	const bunny_sss_thickness = new BasePreset().addEntry(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/models/fbx/bunny_thickness.jpg`
	);
	const disk = new BasePreset().addEntry(node.p.url, `${DEMO_ASSETS_ROOT_URL}/textures/disk.png`);
	const envMap = new BasePreset().addEntry(node.p.url, `${DEMO_ASSETS_ROOT_URL}/textures/piz_compressed.exr`);
	const uv = new BasePreset().addEntry(node.p.url, `${DEMO_ASSETS_ROOT_URL}/textures/uv.jpg`);
	const PavingStones_basis = new BasePreset().addEntry(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/textures/PavingStones.basis`
	);

	collection.setPresets({
		asphalt,
		bunny_sss_thickness,
		disk,
		envMap,
		uv,
		PavingStones_basis,
	});

	return collection;
};
export {ImageCopNode, imageCopNodePresetsCollectionFactory};
