import type {QUnit} from '../../../helpers/QUnit';
import {HierarchyMode} from '../../../../src/engine/operations/sop/Hierarchy';
import {Mesh} from 'three';
import {BufferGeometry} from 'three';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {Poly} from '../../../../src/engine/Poly';
import {withPlayerMode} from '../../../helpers/PlayerMode';
import {FileGLTFSopNode} from '../../../../src/engine/nodes/sop/FileGLTF';
import {FileMPDSopNode} from '../../../../src/engine/nodes/sop/FileMPD';
import {SopTypeFile} from '../../../../src/engine/poly/registers/nodes/types/Sop';
import {
	objectsCount,
	totalPointsCount,
	objectsCountByType,
} from '../../../../src/engine/containers/utils/GeometryContainerUtils';
export function testenginenodessopFile(qUnit: QUnit) {
	function _url(path: string) {
		return `${ASSETS_ROOT}${path}`;
	}

	// async function withFile(path: string, format: GeometryFormat = GeometryFormat.AUTO) {
	// 	const geo1 = window.geo1;
	// 	const fileNode = geo1.createNode('file');
	// 	fileNode.p.url.set(_url(path));
	// 	fileNode.p.format.set(format);

	// 	const container = await fileNode.compute();
	// 	return {container, fileNode};
	// }
	async function withFileDRC(path: string) {
		const geo1 = window.geo1;
		const fileNode = geo1.createNode('fileDRC');
		fileNode.p.url.set(_url(path));

		const container = await fileNode.compute();
		return {container, fileNode};
	}
	async function withFileFBX(path: string) {
		const geo1 = window.geo1;
		const fileNode = geo1.createNode('fileFBX');
		fileNode.p.url.set(_url(path));

		const container = await fileNode.compute();
		return {container, fileNode};
	}
	async function withFileGLTF(path: string) {
		const geo1 = window.geo1;
		const fileNode = geo1.createNode('fileGLTF');
		fileNode.p.url.set(_url(path));

		const container = await fileNode.compute();
		return {container, fileNode};
	}
	async function withFileJSON(path: string) {
		const geo1 = window.geo1;
		const fileNode = geo1.createNode('fileJSON');
		fileNode.p.url.set(_url(path));

		const container = await fileNode.compute();
		return {container, fileNode};
	}

	async function withFileOBJ(path: string) {
		const geo1 = window.geo1;
		const fileNode = geo1.createNode('fileOBJ');
		fileNode.p.url.set(_url(path));

		const container = await fileNode.compute();
		return {container, fileNode};
	}
	async function withFilePDB(path: string) {
		const geo1 = window.geo1;
		const fileNode = geo1.createNode('filePDB');
		fileNode.p.url.set(_url(path));

		const container = await fileNode.compute();
		return {container, fileNode};
	}
	async function withFilePLY(path: string) {
		const geo1 = window.geo1;
		const fileNode = geo1.createNode('filePLY');
		fileNode.p.url.set(_url(path));

		const container = await fileNode.compute();
		return {container, fileNode};
	}
	async function withFileSTL(path: string) {
		const geo1 = window.geo1;
		const fileNode = geo1.createNode('fileSTL');
		fileNode.p.url.set(_url(path));

		const container = await fileNode.compute();
		return {container, fileNode};
	}
	async function withFileUSDZ(path: string) {
		const geo1 = window.geo1;
		const fileNode = geo1.createNode('fileUSDZ');
		fileNode.p.url.set(_url(path));
		const hierarchyNode = geo1.createNode('hierarchy');
		hierarchyNode.setMode(HierarchyMode.REMOVE_PARENT);
		hierarchyNode.setInput(0, fileNode);

		const container = await hierarchyNode.compute();

		return {container, fileNode};
	}

	async function withFileAndHierarchyGLTF(path: string) {
		const geo1 = window.geo1;
		const fileNode = geo1.createNode('fileGLTF');
		fileNode.p.url.set(_url(path));

		const hierarchyNode = geo1.createNode('hierarchy');
		hierarchyNode.setMode(HierarchyMode.REMOVE_PARENT);
		hierarchyNode.setInput(0, fileNode);

		const container = await hierarchyNode.compute();
		return {container, fileNode, hierarchyNode};
	}
	async function withHierarchy(fileNode: FileGLTFSopNode | FileMPDSopNode, levels: number = 1) {
		const hierarchy1 = window.geo1.createNode('hierarchy');
		const file1 = fileNode;
		hierarchy1.p.levels.set(levels);
		hierarchy1.setInput(0, file1);
		hierarchy1.setMode(HierarchyMode.REMOVE_PARENT);
		const container = await hierarchy1.compute();
		return container;
	}

	qUnit.test('SOP file simple', async (assert) => {
		const geo1 = window.geo1;

		const file1 = geo1.createNode('fileOBJ');
		file1.p.url.set(`${ASSETS_ROOT}/models/male.obj`);
		assert.ok(file1.isDirty());

		// const merge1 = geo1.createNode('merge');
		// merge1.setInput(0, file1);

		let container;
		container = await file1.compute();
		assert.ok(!file1.isDirty());
		// let core_group = container.coreContent()!;
		// let {geometry} = core_group.objects()[0];
		assert.equal(totalPointsCount(container), 15012, 'total points_count is 15012');

		file1.p.url.set(`${ASSETS_ROOT}/models/box.obj`);
		assert.ok(file1.isDirty());

		container = await file1.compute();
		assert.ok(!file1.isDirty());
		// core_group = container.coreContent();
		// ({geometry} = core_group.objects()[0]);
		assert.equal(totalPointsCount(container), 36);

		// set error state
		file1.p.url.set('/examplesdoesnotexist/file_sop_doesnotexist.obj');
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
		assert.equal(totalPointsCount(container), 36);
	});

	qUnit.test('SOP file obj wolf', async (assert) => {
		const {container} = await withFileOBJ('/models/wolf.obj');
		const core_content = container.coreContent()!;
		assert.equal(objectsCount(container), 1);
		assert.equal(container.coreContent()!.pointsCount(), 0);
		assert.deepEqual(objectsCountByType(container), {Group: 1});
		assert.equal(core_content.threejsObjects().length, 1);
		assert.equal(core_content.pointsCount(), 0);
		const first_object = core_content.threejsObjects()[0];
		assert.equal(first_object.children.length, 4);

		const first_mesh = first_object.children[0] as Mesh;
		const first_geometry = first_mesh.geometry as BufferGeometry;
		assert.ok(first_geometry.index, 'geometry has index');
	});
	qUnit.test('SOP file json wolf', async (assert) => {
		const {container} = await withFileJSON('models/wolf.json');
		assert.equal(totalPointsCount(container), 5352);
	});
	qUnit.test('SOP file glb stork', async (assert) => {
		const {container} = await withFileGLTF('models/stork.glb');
		assert.equal(totalPointsCount(container), 358);
	});
	qUnit.test('SOP file glb soldier', async (assert) => {
		const {container} = await withFileGLTF('models/soldier.glb');
		assert.equal(totalPointsCount(container), 7434);
	});
	qUnit.test('SOP file glb json', async (assert) => {
		const {container} = await withFileGLTF('models/parrot.glb');
		assert.equal(totalPointsCount(container), 497);
	});
	qUnit.test('SOP file glb horse', async (assert) => {
		const {container} = await withFileGLTF('models/horse.glb');
		assert.equal(totalPointsCount(container), 796);
	});
	qUnit.test('SOP file glb flamingo', async (assert) => {
		const {container} = await withFileGLTF('models/flamingo.glb');
		assert.equal(totalPointsCount(container), 337);
	});
	qUnit.test('SOP file z3 glb with draco', async (assert) => {
		const {container, fileNode} = await withFileGLTF('models/z3.glb');
		assert.equal(container.coreContent()!.pointsCount(), 0);
		const container2 = await withHierarchy(fileNode);
		assert.equal(container2.coreContent()!.pointsCount(), 498800);
	});
	qUnit.test('SOP file draco bunny with format FBX', async (assert) => {
		const {container, fileNode} = await withFileFBX('models/stanford-bunny.fbx');
		assert.equal(container.coreContent()!.pointsCount(), 0);
		const container2 = await withHierarchy(fileNode);
		assert.equal(container2.coreContent()!.pointsCount(), 91014);
	});
	qUnit.test('SOP file draco bunny with format DRC', async (assert) => {
		const {container} = await withFileDRC('models/bunny.drc');
		assert.equal(container.coreContent()!.pointsCount(), 34834);
	});
	qUnit.test('SOP file format pdb', async (assert) => {
		const {container} = await withFilePDB('models/ethanol.pdb');
		assert.equal(container.coreContent()!.pointsCount(), 25);
	});
	qUnit.test('SOP file format ply', async (assert) => {
		const {container} = await withFilePLY('models/dolphins_be.ply');
		assert.equal(container.coreContent()!.pointsCount(), 855);
	});
	qUnit.test('SOP file format stl', async (assert) => {
		const {container} = await withFileSTL('models/warrior.stl');
		assert.equal(container.coreContent()!.pointsCount(), 154059);
	});

	qUnit.test('SOP file format usdz', async (assert) => {
		const {container} = await withFileUSDZ('models/saeukkang.usdz');
		assert.equal(container.coreContent()!.pointsCount(), 75000);
	});

	qUnit.test('SOP file draco bunny with format OBJ', async (assert) => {
		const {container, fileNode} = await withFileFBX('models/bunny.drc');
		assert.equal(
			fileNode.states.error.message(),
			'could not load geometry from https://raw.githubusercontent.com/polygonjs/polygonjs-assets/master/models/bunny.drc (Error: THREE.FBXLoader: Cannot find the version number for the file given.)'
		);
		assert.equal(container.coreContent()?.pointsCount() || 0, 0);
	});

	qUnit.test(
		'SOP file can load multiple glb without conflicts, using the blobs controller in non player mode',
		async (assert) => {
			Poly.blobs.clear();
			await withPlayerMode(false, async () => {
				assert.ok(!Poly.playerMode());
				const data1 = await withFileAndHierarchyGLTF('models/resources/threedscans.com/jenner.glb');
				const data2 = await withFileAndHierarchyGLTF('models/resources/threedscans.com/eagle.glb');
				const data3 = await withFileAndHierarchyGLTF(
					'models/resources/threedscans.com/theodoric_the_great.glb'
				);

				assert.notOk(data1.hierarchyNode.states.error.active());
				assert.notOk(data2.hierarchyNode.states.error.active());
				assert.notOk(data3.hierarchyNode.states.error.active());

				assert.equal(data1.container.coreContent()!.pointsCount(), 153233);
				assert.equal(data2.container.coreContent()!.pointsCount(), 108882);
				assert.equal(data3.container.coreContent()!.pointsCount(), 283248);

				data2.fileNode.p.url.set(_url('models/resources/threedscans.com/eagle.glb?t=2'));
				let container = await data2.hierarchyNode.compute();
				assert.equal(container.coreContent()!.pointsCount(), 108882);

				data2.fileNode.p.url.set(_url('models/resources/threedscans.com/jenner.glb'));
				container = await data2.hierarchyNode.compute();
				assert.equal(container.coreContent()!.pointsCount(), 153233);

				data2.fileNode.p.url.set(_url('models/resources/threedscans.com/jenner.glb?t=3'));
				container = await data2.hierarchyNode.compute();
				assert.equal(container.coreContent()!.pointsCount(), 153233);
			});
		}
	);

	qUnit.test(
		'SOP file can load multiple glb without conflicts, using the blobs controller in player mode',
		async (assert) => {
			Poly.blobs.clear();
			await withPlayerMode(true, async () => {
				assert.ok(Poly.playerMode());
				const data1 = await withFileAndHierarchyGLTF('models/resources/threedscans.com/jenner.glb');
				const data2 = await withFileAndHierarchyGLTF('models/resources/threedscans.com/eagle.glb');
				const data3 = await withFileAndHierarchyGLTF(
					'models/resources/threedscans.com/theodoric_the_great.glb'
				);

				assert.notOk(data1.hierarchyNode.states.error.active());
				assert.notOk(data2.hierarchyNode.states.error.active());
				assert.notOk(data3.hierarchyNode.states.error.active());

				assert.equal(data1.container.coreContent()!.pointsCount(), 153233);
				assert.equal(data2.container.coreContent()!.pointsCount(), 108882);
				assert.equal(data3.container.coreContent()!.pointsCount(), 283248);

				data2.fileNode.p.url.set(_url('models/resources/threedscans.com/eagle.glb?t=2'));
				let container = await data2.hierarchyNode.compute();
				assert.equal(container.coreContent()!.pointsCount(), 108882);

				data2.fileNode.p.url.set(_url('models/resources/threedscans.com/jenner.glb'));
				container = await data2.hierarchyNode.compute();
				assert.equal(container.coreContent()!.pointsCount(), 153233);

				data2.fileNode.p.url.set(_url('models/resources/threedscans.com/jenner.glb?t=3'));
				container = await data2.hierarchyNode.compute();
				assert.equal(container.coreContent()!.pointsCount(), 153233);
			});
		}
	);

	qUnit.test('SOP file nodes work with their default url', async (assert) => {
		const geo1 = window.geo1;
		async function testFileType(fileType: SopTypeFile, pointsCount: number, hierarchyLevels: number = 0) {
			const fileNode = geo1.createNode(fileType);

			if (hierarchyLevels > 0) {
				const hierarchy1 = window.geo1.createNode('hierarchy');
				hierarchy1.p.levels.set(hierarchyLevels);
				hierarchy1.setInput(0, fileNode);
				hierarchy1.setMode(HierarchyMode.REMOVE_PARENT);
				const container = await hierarchy1.compute();
				assert.equal(container.coreContent()!.pointsCount(), pointsCount, fileType);
			} else {
				const container = await fileNode.compute();
				assert.equal(container.coreContent()!.pointsCount(), pointsCount, fileType);
			}
		}

		await testFileType(SopTypeFile.FILE_DRC, 34834);
		await testFileType(SopTypeFile.FILE_FBX, 91014, 1);
		await testFileType(SopTypeFile.FILE_GLTF, 108882, 1);
		await testFileType(SopTypeFile.FILE_JSON, 5352, 2);
		await testFileType(SopTypeFile.FILE_MPD, 118371, 2);
		await testFileType(SopTypeFile.FILE_OBJ, 1404, 1);
		await testFileType(SopTypeFile.FILE_PDB, 25);
		await testFileType(SopTypeFile.FILE_PLY, 855);
		await testFileType(SopTypeFile.FILE_STL, 154059, 0);
		await testFileType(SopTypeFile.FILE_SVG, 164050);
	});
}
