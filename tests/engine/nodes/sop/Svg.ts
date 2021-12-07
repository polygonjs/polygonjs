import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';

async function with_file(path: string) {
	const geo1 = window.geo1;
	const svg1 = geo1.createNode('svg');
	svg1.p.url.set(`${ASSETS_ROOT}/${path}`);

	const container = await svg1.compute();
	return container;
}

QUnit.test('SOP svg with tiger', async (assert) => {
	const container = await with_file('models/svg/tiger.svg');
	const core_content = container.coreContent()!;
	assert.equal(container.objectsCount(), 152);
	assert.equal(container.pointsCount(), 24292);
	assert.deepEqual(container.objectsCountByType(), {Mesh: 152});
	assert.equal(core_content.objects().length, 152);
	assert.equal(core_content.pointsCount(), 24292);
	const first_mesh = core_content.objectsWithGeo()[0];
	assert.equal(first_mesh.children.length, 0);

	const first_geometry = first_mesh.geometry as BufferGeometry;
	assert.ok(first_geometry.index, 'geometry has index');
});
