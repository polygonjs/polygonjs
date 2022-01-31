import {sRGBEncoding, LinearEncoding} from 'three/src/constants';
import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {ImageCopNode} from '../../../src/engine/nodes/cop/Image';
import {PolyDictionary} from '../../../src/types/GlobalTypes';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

interface PolyhavenOptions {
	displacement?: boolean;
}
interface ImageOptions {
	sRGB?: boolean;
}

const imageCopNodePresetsCollectionFactory: PresetsCollectionFactory<ImageCopNode> = (node: ImageCopNode) => {
	const collection = new NodePresetsCollection();

	function sRGBImage(fileName: string) {
		return new BasePreset()
			.addEntry(node.p.url, `${DEMO_ASSETS_ROOT_URL}/textures/${fileName}`)
			.addEntry(node.p.tencoding, 1)
			.addEntry(node.p.encoding, sRGBEncoding);
	}
	function linearImage(fileName: string) {
		return new BasePreset()
			.addEntry(node.p.url, `${DEMO_ASSETS_ROOT_URL}/textures/${fileName}`)
			.addEntry(node.p.tencoding, 0)
			.addEntry(node.p.encoding, LinearEncoding);
	}
	const asphalt = sRGBImage(`asphalt.jpg`);
	const bunny_SSS_thickness = new BasePreset()
		.addEntry(node.p.url, `${DEMO_ASSETS_ROOT_URL}/models/fbx/bunny_thickness.jpg`)
		.addEntry(node.p.tencoding, 0)
		.addEntry(node.p.encoding, LinearEncoding)
		.addEntry(node.p.encoding, LinearEncoding);
	const disk = linearImage(`disk.png`);
	const envMap = linearImage(`piz_compressed.exr`);
	const uv = sRGBImage(`uv.jpg`);
	const PavingStones_basis = sRGBImage(`PavingStones.basis`);

	function artveeSet() {
		function artvee(fileName: string) {
			return new BasePreset()
				.addEntry(node.p.url, `${DEMO_ASSETS_ROOT_URL}/textures/resources/artvee.com/${fileName}`)
				.addEntry(node.p.tanisotropy, 1)
				.addEntry(node.p.useRendererMaxAnisotropy, 1)
				.addEntry(node.p.tminFilter, 1)
				.addEntry(node.p.tmagFilter, 1)
				.addEntry(node.p.tencoding, 1)
				.addEntry(node.p.encoding, sRGBEncoding);
		}
		return {
			'all-his-own': artvee('all-his-own-by-John-Samuel-Pughe.jpg'),
			'Bouquet-of-Flowers-in-a-Blue-Porcelain-Vase': artvee(
				'Bouquet-of-Flowers-in-a-Blue-Porcelain-Vase-by-Anne-Vallayer-Coster.jpg'
			),
			'Samson-and-Delilah': artvee('Samson-and-Delilah-by-Gerard-van-Honthorst.jpg'),
			'The-Milkmaid': artvee('The-Milkmaid-Johannes-Vermeer.jpg'),
			'The-Triumph-of-Aemilius-Paulus': artvee('The-Triumph-of-Aemilius-Paulus.jpg'),
		};
	}
	function polyhavenSets() {
		function polyhaven(fileName: string, options?: ImageOptions) {
			const preset = new BasePreset()
				.addEntry(node.p.url, `${DEMO_ASSETS_ROOT_URL}/textures/resources/polyhaven.com/${fileName}`)
				.addEntry(node.p.tanisotropy, 1)
				.addEntry(node.p.useRendererMaxAnisotropy, 1)
				.addEntry(node.p.tminFilter, 1)
				.addEntry(node.p.tmagFilter, 1);

			if (options && options.sRGB) {
				preset.addEntry(node.p.tencoding, 1).addEntry(node.p.encoding, sRGBEncoding);
			} else {
				preset.addEntry(node.p.tencoding, 0).addEntry(node.p.encoding, LinearEncoding);
			}

			return preset;
		}
		function polyhavenSet(setName: string, options?: PolyhavenOptions) {
			const elements: PolyDictionary<BasePreset> = {
				[`${setName}/diffuse`]: polyhaven(`${setName}/2k/diffuse.jpg`, {sRGB: true}),
				[`${setName}/rough`]: polyhaven(`${setName}/2k/rough.jpg`),
			};
			let displacement = true;
			if (options && options.displacement != null) {
				displacement = options.displacement;
			}
			if (displacement) {
				elements[`${setName}/displacement`] = polyhaven(`${setName}/2k/displacement.png`);
			}

			return elements;
		}
		return {
			...polyhavenSet('brick_floor_002'),
			...polyhavenSet('brick_floor_003'),
			...polyhavenSet('concrete_floor_painted'),
			...polyhavenSet('floor_tiles_06'),
			...polyhavenSet('floor_tiles_08'),
			...polyhavenSet('large_floor_tiles_02'),
			...polyhavenSet('marble_01'),
			...polyhavenSet('medieval_blocks_05'),
			...polyhavenSet('medieval_blocks_05'),
			...polyhavenSet('square_floor'),
			...polyhavenSet('tiled_floor_001'),
			...polyhavenSet('aerial_rocks_02'),
			...polyhavenSet('brick_moss_001'),
			...polyhavenSet('denmin_fabric_02', {displacement: false}),
			...polyhavenSet('fabric_pattern_07', {displacement: false}),
		};
	}

	collection.setPresets({
		asphalt,
		bunny_SSS_thickness,
		disk,
		envMap,
		uv,
		PavingStones_basis,
		...artveeSet(),
		...polyhavenSets(),
	});

	return collection;
};
export const imageCopPresetRegister: PresetRegister<typeof ImageCopNode, ImageCopNode> = {
	nodeClass: ImageCopNode,
	setupFunc: imageCopNodePresetsCollectionFactory,
};
