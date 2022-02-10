import {HierarchyMode, HIERARCHY_MODES} from '../../../../src/engine/operations/sop/Hierarchy';
import {Mesh} from 'three/src/objects/Mesh';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {GeometryFormat} from '../../../../src/core/loader/Geometry';
import {Poly} from '../../../../src/engine/Poly';
import {withPlayerMode} from '../../../helpers/PlayerMode';

function _url(path: string) {
	return `${ASSETS_ROOT}${path}`;
}

async function withFile(path: string, format: GeometryFormat = GeometryFormat.AUTO) {
	const geo1 = window.geo1;
	const fileNode = geo1.createNode('file');
	fileNode.p.url.set(_url(path));
	fileNode.p.format.set(format);

	const container = await fileNode.compute();
	return {container, fileNode};
}

async function withFileAndHierarchy(path: string, format: GeometryFormat = GeometryFormat.AUTO) {
	const geo1 = window.geo1;
	const fileNode = geo1.createNode('file');
	fileNode.p.url.set(_url(path));
	fileNode.p.format.set(format);

	const hierarchyNode = geo1.createNode('hierarchy');
	hierarchyNode.p.mode.set(HIERARCHY_MODES.indexOf(HierarchyMode.REMOVE_PARENT));
	hierarchyNode.setInput(0, fileNode);

	const container = await hierarchyNode.compute();
	return {container, fileNode, hierarchyNode};
}
async function withHierarchy(levels: number = 1) {
	const hierarchy1 = window.geo1.createNode('hierarchy');
	const file1 = window.geo1.nodesByType('file')[0];
	hierarchy1.p.levels.set(levels);
	hierarchy1.setInput(0, file1);
	hierarchy1.p.mode.set(HIERARCHY_MODES.indexOf(HierarchyMode.REMOVE_PARENT));
	const container = await hierarchy1.compute();
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
	container = await file1.compute();
	assert.ok(!file1.isDirty());
	// let core_group = container.coreContent()!;
	// let {geometry} = core_group.objects()[0];
	assert.equal(container.totalPointsCount(), 15012, 'total points_count is 15012');

	file1.p.url.set(`${ASSETS_ROOT}/models/box.obj`);
	assert.ok(file1.isDirty());

	container = await file1.compute();
	assert.ok(!file1.isDirty());
	// core_group = container.coreContent();
	// ({geometry} = core_group.objects()[0]);
	assert.equal(container.totalPointsCount(), 36);

	// set error state
	file1.p.url.set('/test/file_sop_doesnotexist.obj');
	assert.ok(file1.isDirty());
	container = await file1.compute();
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
	container = await file1.compute();
	assert.ok(!file1.isDirty());
	assert.ok(!file1.states.error.active());
	core_group = container.coreContent()!;
	//geometry = group.children[0].geometry
	assert.ok(core_group);
	assert.equal(container.totalPointsCount(), 36);
});

QUnit.test('SOP file obj wolf', async (assert) => {
	const {container} = await withFile('/models/wolf.obj');
	const core_content = container.coreContent()!;
	assert.equal(container.objectsCount(), 1);
	assert.equal(container.pointsCount(), 0);
	assert.deepEqual(container.objectsCountByType(), {Group: 1});
	assert.equal(core_content.objects().length, 1);
	assert.equal(core_content.pointsCount(), 0);
	const first_object = core_content.objects()[0];
	assert.equal(first_object.children.length, 4);

	const first_mesh = first_object.children[0] as Mesh;
	const first_geometry = first_mesh.geometry as BufferGeometry;
	assert.ok(first_geometry.index, 'geometry has index');
});
QUnit.test('SOP file json wolf', async (assert) => {
	const {container} = await withFile('models/wolf.json');
	assert.equal(container.totalPointsCount(), 5352);
});
QUnit.test('SOP file glb stork', async (assert) => {
	const {container} = await withFile('models/stork.glb');
	assert.equal(container.totalPointsCount(), 358);
});
QUnit.test('SOP file glb soldier', async (assert) => {
	const {container} = await withFile('models/soldier.glb');
	assert.equal(container.totalPointsCount(), 7434);
});
QUnit.test('SOP file glb json', async (assert) => {
	const {container} = await withFile('models/parrot.glb');
	assert.equal(container.totalPointsCount(), 497);
});
QUnit.test('SOP file glb horse', async (assert) => {
	const {container} = await withFile('models/horse.glb');
	assert.equal(container.totalPointsCount(), 796);
});
QUnit.test('SOP file glb flamingo', async (assert) => {
	const {container} = await withFile('models/flamingo.glb');
	assert.equal(container.totalPointsCount(), 337);
});
QUnit.test('SOP file z3 glb with draco', async (assert) => {
	const {container} = await withFile('models/z3.glb');
	assert.equal(container.pointsCount(), 0);
	const container2 = await withHierarchy();
	assert.equal(container2.pointsCount(), 498800);
});
QUnit.test('SOP file draco bunny', async (assert) => {
	const {container} = await withFile('models/bunny.drc');
	assert.equal(container.pointsCount(), 34834);
});
QUnit.test('SOP file format pdb', async (assert) => {
	const {container} = await withFile('models/ethanol.pdb');
	assert.equal(container.pointsCount(), 25);
});
QUnit.test('SOP file format ply', async (assert) => {
	const {container} = await withFile('models/dolphins_be.ply');
	assert.equal(container.pointsCount(), 855);
});
QUnit.test('SOP file format stl', async (assert) => {
	const {container} = await withFile('models/warrior.stl');
	assert.equal(container.pointsCount(), 154059);
});
QUnit.test('SOP file draco bunny with format DRC', async (assert) => {
	const {container} = await withFile('models/bunny.drc', GeometryFormat.DRC);
	assert.equal(container.pointsCount(), 34834);
});
QUnit.test('SOP file Ldraw', async (assert) => {
	const {container} = await withFile('models/889-1-RadarTruck.mpd_Packed.mpd', GeometryFormat.LDRAW);
	assert.equal(container.pointsCount(), 0);
	const container2 = await withHierarchy(3);
	assert.equal(container2.pointsCount(), 75218);
});
QUnit.test('SOP file draco bunny with format OBJ', async (assert) => {
	const {container, fileNode} = await withFile('models/bunny.drc', GeometryFormat.FBX);
	assert.equal(
		fileNode.states.error.message(),
		'could not load geometry from https://raw.githubusercontent.com/polygonjs/polygonjs-assets/master/models/bunny.drc (Error: THREE.FBXLoader: Cannot find the version number for the file given.)'
	);
	assert.equal(container.pointsCount(), 0);
});

QUnit.test(
	'SOP file can load multiple glb without conflicts, using the blobs controller in non player mode',
	async (assert) => {
		Poly.blobs.clear();
		await withPlayerMode(false, async () => {
			assert.ok(!Poly.playerMode());
			const data1 = await withFileAndHierarchy('models/resources/threedscans.com/jenner.glb');
			const data2 = await withFileAndHierarchy('models/resources/threedscans.com/eagle.glb');
			const data3 = await withFileAndHierarchy('models/resources/threedscans.com/theodoric_the_great.glb');

			assert.notOk(data1.hierarchyNode.states.error.active());
			assert.notOk(data2.hierarchyNode.states.error.active());
			assert.notOk(data3.hierarchyNode.states.error.active());

			assert.equal(data1.container.pointsCount(), 153233);
			assert.equal(data2.container.pointsCount(), 108882);
			assert.equal(data3.container.pointsCount(), 283248);

			data2.fileNode.p.url.set(_url('models/resources/threedscans.com/eagle.glb?t=2'));
			let container = await data2.hierarchyNode.compute();
			assert.equal(container.pointsCount(), 108882);

			data2.fileNode.p.url.set(_url('models/resources/threedscans.com/jenner.glb'));
			container = await data2.hierarchyNode.compute();
			assert.equal(container.pointsCount(), 153233);

			data2.fileNode.p.url.set(_url('models/resources/threedscans.com/jenner.glb?t=3'));
			container = await data2.hierarchyNode.compute();
			assert.equal(container.pointsCount(), 153233);
		});
	}
);

QUnit.test(
	'SOP file can load multiple glb without conflicts, using the blobs controller in player mode',
	async (assert) => {
		Poly.blobs.clear();
		await withPlayerMode(true, async () => {
			assert.ok(Poly.playerMode());
			const data1 = await withFileAndHierarchy('models/resources/threedscans.com/jenner.glb');
			const data2 = await withFileAndHierarchy('models/resources/threedscans.com/eagle.glb');
			const data3 = await withFileAndHierarchy('models/resources/threedscans.com/theodoric_the_great.glb');

			assert.notOk(data1.hierarchyNode.states.error.active());
			assert.notOk(data2.hierarchyNode.states.error.active());
			assert.notOk(data3.hierarchyNode.states.error.active());

			assert.equal(data1.container.pointsCount(), 153233);
			assert.equal(data2.container.pointsCount(), 108882);
			assert.equal(data3.container.pointsCount(), 283248);

			data2.fileNode.p.url.set(_url('models/resources/threedscans.com/eagle.glb?t=2'));
			let container = await data2.hierarchyNode.compute();
			assert.equal(container.pointsCount(), 108882);

			data2.fileNode.p.url.set(_url('models/resources/threedscans.com/jenner.glb'));
			container = await data2.hierarchyNode.compute();
			assert.equal(container.pointsCount(), 153233);

			data2.fileNode.p.url.set(_url('models/resources/threedscans.com/jenner.glb?t=3'));
			container = await data2.hierarchyNode.compute();
			assert.equal(container.pointsCount(), 153233);
		});
	}
);
