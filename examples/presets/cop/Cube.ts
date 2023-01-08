import {sRGBEncoding} from 'three';
import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {CubeCopNode, CubeMapUrlAxis, cubeMapUrlExpression, CubeMapUrlKey} from '../../../src/engine/nodes/cop/Cube';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const cubeCopNodePresetsCollectionFactory: PresetsCollectionFactory<CubeCopNode> = (node: CubeCopNode) => {
	const collection = new NodePresetsCollection();

	function defaultUrls(preset: BasePreset) {
		return preset
			.addEntry(node.p.px, cubeMapUrlExpression(CubeMapUrlKey.P, CubeMapUrlAxis.X))
			.addEntry(node.p.nx, cubeMapUrlExpression(CubeMapUrlKey.N, CubeMapUrlAxis.X))
			.addEntry(node.p.py, cubeMapUrlExpression(CubeMapUrlKey.P, CubeMapUrlAxis.Y))
			.addEntry(node.p.ny, cubeMapUrlExpression(CubeMapUrlKey.N, CubeMapUrlAxis.Y))
			.addEntry(node.p.pz, cubeMapUrlExpression(CubeMapUrlKey.P, CubeMapUrlAxis.Z))
			.addEntry(node.p.nz, cubeMapUrlExpression(CubeMapUrlKey.N, CubeMapUrlAxis.Z));
	}
	function posNegUrls(preset: BasePreset) {
		function _expression(urlKey: string, urlAxis: string) {
			return `\`ch('prefix')\`${urlKey}${urlAxis}\`ch('suffix')\``;
		}
		const n = 'neg';
		const p = 'pos';

		return preset
			.addEntry(node.p.px, _expression(p, CubeMapUrlAxis.X))
			.addEntry(node.p.nx, _expression(n, CubeMapUrlAxis.X))
			.addEntry(node.p.py, _expression(p, CubeMapUrlAxis.Y))
			.addEntry(node.p.ny, _expression(n, CubeMapUrlAxis.Y))
			.addEntry(node.p.pz, _expression(p, CubeMapUrlAxis.Z))
			.addEntry(node.p.nz, _expression(n, CubeMapUrlAxis.Z));
	}

	const piza = defaultUrls(
		new BasePreset()
			.addEntry(node.p.prefix, `${DEMO_ASSETS_ROOT_URL}/textures/cube/pisa/`)
			.addEntry(node.p.suffix, `.png`)
			.addEntry(node.p.tencoding, 1)
			.addEntry(node.p.encoding, sRGBEncoding)
	);

	const bridge = posNegUrls(
		new BasePreset()
			.addEntry(node.p.prefix, `${DEMO_ASSETS_ROOT_URL}/textures/cube/Bridge2/`)
			.addEntry(node.p.suffix, `.jpg`)
			.addEntry(node.p.tencoding, 1)
			.addEntry(node.p.encoding, sRGBEncoding)
	);

	collection.setPresets({
		piza,
		bridge,
	});

	return collection;
};
export const cubeCopPresetRegister: PresetRegister<typeof CubeCopNode, CubeCopNode> = {
	nodeClass: CubeCopNode,
	setupFunc: cubeCopNodePresetsCollectionFactory,
};
