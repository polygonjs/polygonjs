import {HierarchyMode, HIERARCHY_MODES} from '../../../../src/core/operations/sop/Hierarchy';
import {Mesh} from 'three/src/objects/Mesh';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {ASSETS_ROOT} from '../../../helpers/AssetsUtils';

async function with_file(path: string) {
	const geo1 = window.geo1;
	const file1 = geo1.createNode('file');
	file1.p.url.set(`${ASSETS_ROOT}/${path}`);

	const container = await file1.requestContainer();
	return container;
}
async function with_hierarchy() {
	const hierarchy1 = window.geo1.createNode('hierarchy');
	const file1 = window.geo1.nodesByType('file')[0];
	hierarchy1.setInput(0, file1);
	hierarchy1.p.mode.set(HIERARCHY_MODES.indexOf(HierarchyMode.REMOVE_PARENT));
	const container = await hierarchy1.requestContainer();
	return container;
}

QUnit.test('SOP file simple', async (assert) => {
	const geo1 = window.geo1;

	const file1 = geo1.createNode('file');
	file1.p.url.set(`${ASSETS_ROOT}/models/male.obj`);
	assert.ok(file1.isDirty());

	// const merge1 = geo1.createNode('merge');
	// merge1.setInput(0, file1);

	let container;
	container = await file1.requestContainer();
	assert.ok(!file1.isDirty());
	// let core_group = container.coreContent()!;
	// let {geometry} = core_group.objects()[0];
	assert.equal(container.totalPointsCount(), 15012, 'total points_count is 15012');

	file1.p.url.set(`${ASSETS_ROOT}/models/box.obj`);
	assert.ok(file1.isDirty());

	container = await file1.requestContainer();
	assert.ok(!file1.isDirty());
	// core_group = container.coreContent();
	// ({geometry} = core_group.objects()[0]);
	assert.equal(container.totalPointsCount(), 36);

	// set error state
	file1.p.url.set('/test/file_sop_doesnotexist.obj');
	assert.ok(file1.isDirty());
	container = await file1.requestContainer();
	assert.ok(!file1.isDirty());
	assert.ok(file1.states.error.active(), 'file sop to file_sop_doesnotexist is errored');

	// this only works if I have a path catch all in routes.db
	// get '*path' => 'errors#route_not_found'
	// assert.equal(file1.error_message(), "could not load geometry from /tests/fixtures/files/geometries/doesnotexist.obj (Error: THREE.OBJLoader: Unexpected line: \"<!DOCTYPE html>\")");
	let core_group = container.coreContent()!;
	assert.notOk(core_group, 'file sop core group is empty');
	// assert.equal(core_group.objects().length, 0, 'content has 0 points');

	// clear error state
	file1.p.url.set(`${ASSETS_ROOT}/models/box.obj`);
	assert.ok(file1.isDirty());
	container = await file1.requestContainer();
	assert.ok(!file1.isDirty());
	assert.ok(!file1.states.error.active());
	core_group = container.coreContent()!;
	//geometry = group.children[0].geometry
	assert.ok(core_group);
	assert.equal(container.totalPointsCount(), 36);
});

QUnit.test('SOP file obj wolf', async (assert) => {
	const container = await with_file('/models/wolf.obj');
	const core_content = container.coreContent()!;
	assert.equal(container.objectsCount(), 1);
	assert.equal(container.pointsCount(), 0);
	console.log(container.objectsCountByType());
	assert.deepEqual(container.objectsCountByType(), {Object3D: 1});
	assert.equal(core_content.objects().length, 1);
	assert.equal(core_content.pointsCount(), 0);
	const first_object = core_content.objects()[0];
	assert.equal(first_object.children.length, 4);

	const first_mesh = first_object.children[0] as Mesh;
	const first_geometry = first_mesh.geometry as BufferGeometry;
	console.log('first_geometry', first_geometry);
	assert.ok(first_geometry.index, 'geometry has index');
});
QUnit.test('SOP file json wolf', async (assert) => {
	const container = await with_file('/models/wolf.json');
	assert.equal(container.totalPointsCount(), 5352);
});
QUnit.test('SOP file glb stork', async (assert) => {
	const container = await with_file('/models/stork.glb');
	assert.equal(container.totalPointsCount(), 358);
});
QUnit.test('SOP file glb soldier', async (assert) => {
	const container = await with_file('/models/soldier.glb');
	assert.equal(container.totalPointsCount(), 7434);
});
QUnit.test('SOP file glb json', async (assert) => {
	const container = await with_file('/models/parrot.glb');
	assert.equal(container.totalPointsCount(), 497);
});
QUnit.test('SOP file glb horse', async (assert) => {
	const container = await with_file('/models/horse.glb');
	assert.equal(container.totalPointsCount(), 796);
});
QUnit.test('SOP file glb flamingo', async (assert) => {
	const container = await with_file('/models/flamingo.glb');
	assert.equal(container.totalPointsCount(), 337);
});
QUnit.test('SOP file z3 glb with draco', async (assert) => {
	const container = await with_file('/models/z3.glb');
	assert.equal(container.pointsCount(), 0);
	const container2 = await with_hierarchy();
	assert.equal(container2.pointsCount(), 498800);
});
QUnit.test('SOP file draco bunny', async (assert) => {
	const container = await with_file('/models/bunny.drc');
	assert.equal(container.pointsCount(), 34834);
});
QUnit.test('SOP file format pdb', async (assert) => {
	const container = await with_file('/models/ethanol.pdb');
	assert.equal(container.pointsCount(), 25);
});
QUnit.test('SOP file format ply', async (assert) => {
	const container = await with_file('/models/dolphins_be.ply');
	assert.equal(container.pointsCount(), 855);
});
