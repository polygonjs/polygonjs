import {BufferGeometry} from 'three';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';

function assetPath(path: string) {
	return `${ASSETS_ROOT}/${path}`;
}
async function withFile(path: string) {
	const geo1 = window.geo1;
	const fileSVG1 = geo1.createNode('fileSVG');
	fileSVG1.p.url.set(assetPath(path));

	const container = await fileSVG1.compute();
	return container;
}

QUnit.test('SOP svg with tiger', async (assert) => {
	const container = await withFile('models/svg/tiger.svg');
	const core_content = container.coreContent()!;
	assert.equal(container.objectsCount(), 466);
	assert.equal(container.pointsCount(), 164050);
	assert.deepEqual(container.objectsCountByType(), {Mesh: 466});
	assert.equal(core_content.threejsObjects().length, 466);
	assert.equal(core_content.pointsCount(), 164050);
	const first_mesh = core_content.threejsObjectsWithGeo()[0];
	assert.equal(first_mesh.children.length, 0);

	const first_geometry = first_mesh.geometry as BufferGeometry;
	assert.ok(first_geometry.index, 'geometry has index');
});
QUnit.test('SOP svg with wolf', async (assert) => {
	const container = await withFile('models/svg/wolf.svg');
	const core_content = container.coreContent()!;
	assert.equal(container.objectsCount(), 60);
	assert.equal(container.pointsCount(), 43260);
	assert.deepEqual(container.objectsCountByType(), {Mesh: 60});
	assert.equal(core_content.threejsObjects().length, 60);
	assert.equal(core_content.pointsCount(), 43260);
	const first_mesh = core_content.threejsObjectsWithGeo()[0];
	assert.equal(first_mesh.children.length, 0);

	const first_geometry = first_mesh.geometry as BufferGeometry;
	assert.ok(first_geometry.index, 'geometry has index');
});

QUnit.test('SOP svg can error and still be usable', async (assert) => {
	const geo1 = window.geo1;
	const fileSVG1 = geo1.createNode('fileSVG');

	fileSVG1.p.url.set(assetPath('models/svg/doesnotexist.svg'));
	let container = await fileSVG1.compute();
	assert.equal(container.objectsCount(), 0);
	assert.equal(
		fileSVG1.states.error.message(),
		'fail to load SVG (fetch for "https://raw.githubusercontent.com/polygonjs/polygonjs-assets/master/models/svg/doesnotexist.svg" responded with 404: )'
	);

	fileSVG1.p.url.set(assetPath('models/svg/wolf.svg'));
	container = await fileSVG1.compute();
	assert.equal(container.objectsCount(), 60);
	assert.notOk(fileSVG1.states.error.message());
});
