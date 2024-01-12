import type {QUnit} from '../../../helpers/QUnit';
import {BufferGeometryWithBVH} from '../../../../src/core/geometry/bvh/three-mesh-bvh';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';

function _url(path: string) {
	return `${ASSETS_ROOT}${path}`;
}

export function testenginenodessopBVH(qUnit: QUnit) {
	qUnit.test('sop/BVH simple', async (assert) => {
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const sphere1 = geo1.createNode('sphere');
		const BVH1 = geo1.createNode('BVH');
		BVH1.setInput(0, sphere1);

		let container = await BVH1.compute();
		const core_group = container.coreContent();
		const geometry = core_group?.threejsObjectsWithGeo()[0].geometry!;
		assert.ok((geometry as BufferGeometryWithBVH).boundsTree);
	});

	qUnit.test('sop/BVH is cloned', async (assert) => {
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const sphere1 = geo1.createNode('sphere');
		const BVH1 = geo1.createNode('BVH');
		const transform1 = geo1.createNode('transform');
		BVH1.setInput(0, sphere1);
		transform1.setInput(0, BVH1);

		let container = await BVH1.compute();
		let coreGroup = container.coreContent();
		let geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry!;
		assert.ok((geometry as BufferGeometryWithBVH).boundsTree);

		container = await transform1.compute();
		coreGroup = container.coreContent();
		geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry!;
		assert.ok((geometry as BufferGeometryWithBVH).boundsTree);
	});

	qUnit.test('sop/BVH compact', async (assert) => {
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const fileGLTF1 = geo1.createNode('fileGLTF');
		const BVH1 = geo1.createNode('BVH');
		BVH1.setInput(0, fileGLTF1);

		fileGLTF1.p.url.set(_url('models/dungeon_low_poly_game_level_challenge/scene.gltf'));

		async function compute() {
			const container = await BVH1.compute();
			const coreGroup = container.coreContent();
			const firstObject = coreGroup?.threejsObjectsWithGeo()[0];
			const geometry = firstObject?.geometry;
			const firstBoundsTree = (geometry as BufferGeometryWithBVH | undefined)?.boundsTree;
			const rootsCount: number = (firstBoundsTree as any)?._roots.length || 0;
			return {firstBoundsTree, rootsCount};
		}
		BVH1.p.compact.set(false);
		assert.notOk((await compute()).firstBoundsTree, 'no firstBoundsTree');

		BVH1.p.compact.set(true);
		assert.ok((await compute()).firstBoundsTree, 'firstBoundsTree');
		assert.equal((await compute()).rootsCount, 798, '798 roots');
	});
}
