import {CoreWalker} from '../../../src/core/Walker';
import {PolyScene} from '../../../src/engine/scene/PolyScene';
import {SceneJsonImporter} from '../../../src/engine/io/json/import/Scene';
import {SceneJsonExporter} from '../../../src/engine/io/json/export/Scene';
import {MaterialsNetworkObjNode} from '../../../src/engine/nodes/obj/MaterialsNetwork';
import {MaterialSopNode} from '../../../src/engine/nodes/sop/Material';
import {ParamType} from '../../../src/engine/poly/ParamType';
import {GeoObjNode} from '../../../src/engine/nodes/obj/Geo';
import {MaterialsNetworkSopNode} from '../../../src/engine/nodes/sop/MaterialsNetwork';
// import {ObjectMergeSopNode} from '../../../src/engine/nodes/sop/ObjectMerge';
import {saveAndLoadScene} from '../../helpers/ImportHelper';
import {MeshStandardMatNode} from '../../../src/engine/nodes/mat/MeshStandard';
import {ASSETS_ROOT} from '../../../src/core/loader/AssetsUtils';

// async function saveAndLoad(scene: PolyScene) {
// 	const data = new SceneJsonExporter(scene).data();

// 	// console.log('************ LOAD **************');
// 	const scene2 = await SceneJsonImporter.loadData(data);
// 	await scene.waitForCooksCompleted();
// 	return scene2;
// }

QUnit.test('expression ch refers to a node that is later added', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	transform1.setInput(0, box1);
	const param = transform1.p.t.x;
	param.set("ch('../transform2/tx')");

	await transform1.compute();
	await param.compute();
	assert.equal(param.value, 0);
	assert.ok(param.states.error.active());
	assert.equal(
		param.states.error.message(),
		"expression returns an invalid type (undefined) (ch('../transform2/tx'))"
	);
	assert.ok(param.isDirty());

	const transform2 = geo1.createNode('transform');
	assert.equal(transform2.name(), 'transform2');
	assert.ok(param.isDirty(), 'param is now dirty');
	transform2.p.t.x.set(5);
	await param.compute();
	assert.equal(param.value, 5);
	assert.ok(!param.isDirty(), 'param is not dirty anymore');
});

QUnit.test('expression point refers to a node that is later added', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	transform1.setInput(0, box1);
	const param = transform1.p.t.x;
	param.set("0.1*point('../data1', 'value', 0)");

	await transform1.compute();
	await param.compute();
	assert.equal(param.value, 0);
	assert.ok(param.states.error.active());
	assert.equal(
		param.states.error.message(),
		"expression error: \"0.1*point('../data1', 'value', 0)\" (invalid input (../data1))"
	);
	assert.ok(param.isDirty());

	const data = geo1.createNode('data');
	assert.equal(data.name(), 'data1');
	assert.ok(param.isDirty(), 'param is now dirty');
	await param.compute();
	assert.equal(param.value, -4);
	assert.ok(!param.isDirty(), 'param is not dirty anymore');
});

QUnit.test('a node referenced in an expression gets renamed involves updating the expression', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	transform1.setInput(0, box1);

	const transform2 = geo1.createNode('transform');
	assert.equal(transform2.name(), 'transform2');

	transform1.p.t.x.set("ch('../transform2/tx')");
	await transform1.compute();

	assert.includes(transform1.p.t.x.graphPredecessors(), transform2.p.t.x);

	assert.equal(transform1.p.t.x.rawInput(), "ch('../transform2/tx')");
	transform2.setName('transform_RENAMED_TO TEST');
	assert.equal(transform1.p.t.x.rawInput(), "ch('../transform_RENAMED_TO_TEST/tx')");

	transform2.setName('transform_MASTER');
	assert.equal(transform1.p.t.x.rawInput(), "ch('../transform_MASTER/tx')");

	transform2.setName('transform_MASTER2');
	assert.equal(transform1.p.t.x.rawInput(), "ch('../transform_MASTER2/tx')");
});

QUnit.test('a top node referenced in an expression gets renamed involves updating the expression', async (assert) => {
	const scene = window.scene;
	const root = scene.root();
	const geo1 = window.geo1;

	const camera = root.createNode('perspectiveCamera');
	camera.p.t.x.set(1);

	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	transform1.setInput(0, box1);
	const param = transform1.p.t.x;
	param.set(`ch('/${camera.name()}/tx')`);

	await param.compute();
	assert.equal(param.value, 1);

	camera.p.t.x.set(2);
	await param.compute();
	assert.equal(param.value, 2);

	camera.setName('new_camera');
	assert.equal(param.rawInput(), "ch('/new_camera/tx')");
	await param.compute();
	assert.equal(param.value, 2);

	camera.p.t.x.set(3);
	await param.compute();
	assert.equal(param.value, 3);
});

QUnit.test('a relative path in a node path param gets updated when ref changes name', async (assert) => {
	const geo1 = window.geo1;
	const MAT = window.MAT;
	const material_sop = geo1.createNode('material');
	const material = MAT.createNode('meshBasic');
	const path_param = material_sop.p.material;
	path_param.set(material.path());

	await path_param.compute();
	assert.equal(path_param.value.path(), '/MAT/meshBasic1');

	material.setName('new_name');
	await path_param.compute();
	assert.equal(path_param.value.path(), '/MAT/new_name');

	MAT.setName('new_MAT');
	await path_param.compute();
	assert.equal(path_param.value.path(), '/new_MAT/new_name');

	material.setName('new_name_again');
	await path_param.compute();
	assert.equal(path_param.value.path(), '/new_MAT/new_name_again');
});

// QUnit.test('an absolute path in a node path param gets updated when ref changes name', async (assert) => {
// 	const scene = window.scene;
// 	const geo = window.geo1;
// 	const anim = scene.root().createNode('animationsNetwork');
// 	const target = anim.createNode('target');
// 	const box = geo.createNode('box');
// 	const param = target.p.nodePath;

// 	assert.equal(param.type(), ParamType.OPERATOR_PATH);

// 	await scene.waitForCooksCompleted();

// 	param.set(box.path());

// 	await param.compute();
// 	assert.equal(param.value, '/geo1/box1');

// 	box.setName('new_name');
// 	// assert.ok(param.isDirty(), 'is dirty on renamed 1');
// 	// await param.compute();
// 	// assert.notOk(param.isDirty());
// 	assert.equal(param.value, '/geo1/new_name');

// 	box.setName('new_name2');
// 	// assert.ok(param.isDirty(), 'is dirty on renamed 2');
// 	// await param.compute();
// 	// assert.notOk(param.isDirty());
// 	assert.equal(param.value, '/geo1/new_name2');

// 	geo.setName('new_event');
// 	// assert.ok(param.isDirty());
// 	// await param.compute();
// 	// assert.notOk(param.isDirty());
// 	assert.equal(param.value, '/new_event/new_name2');

// 	box.setName('new_name_again');
// 	// assert.ok(param.isDirty());
// 	// await param.compute();
// 	// assert.notOk(param.isDirty());
// 	assert.equal(param.value, '/new_event/new_name_again');
// });

QUnit.test('an absolute path in a node path param gets updated when ref changes name', async (assert) => {
	const scene = window.scene;
	const root = scene.root();
	const event = root.createNode('eventsNetwork');
	const orbit = event.createNode('cameraOrbitControls');
	const camera = root.createNode('perspectiveCamera');
	const controls_param = camera.p.controls;
	assert.equal(controls_param.type(), ParamType.NODE_PATH);

	await scene.waitForCooksCompleted();

	controls_param.set(orbit.path());

	await controls_param.compute();
	assert.equal(controls_param.value.path(), '/eventsNetwork1/cameraOrbitControls1');

	orbit.setName('new_name');
	assert.ok(controls_param.isDirty(), 'is dirty on renamed 1');
	await controls_param.compute();
	assert.notOk(controls_param.isDirty());
	assert.equal(controls_param.value.path(), '/eventsNetwork1/new_name');

	orbit.setName('new_name2');
	assert.ok(controls_param.isDirty(), 'is dirty on renamed 2');
	await controls_param.compute();
	assert.notOk(controls_param.isDirty());
	assert.equal(controls_param.value.path(), '/eventsNetwork1/new_name2');

	event.setName('new_event');
	assert.ok(controls_param.isDirty());
	await controls_param.compute();
	assert.notOk(controls_param.isDirty());
	assert.equal(controls_param.value.path(), '/new_event/new_name2');

	orbit.setName('new_name_again');
	assert.ok(controls_param.isDirty());
	await controls_param.compute();
	assert.notOk(controls_param.isDirty());
	assert.equal(controls_param.value.path(), '/new_event/new_name_again');
});

QUnit.test('mutiple params referencing a node with an absolute path all get updated', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	await scene.waitForCooksCompleted();

	const MAT = window.MAT;
	const box = geo1.createNode('box');
	geo1.flags.display.set(false);
	box.flags.display.set(true);
	const meshBasic = MAT.createNode('meshBasic');
	const material1 = geo1.createNode('material');
	const material2 = geo1.createNode('material');
	const materials = [material1, material2];
	materials.forEach((m) => m.p.material.set(meshBasic.path()));

	assert.deepEqual(
		materials.map((m) => m.pv.material.path()),
		['/MAT/meshBasic1', '/MAT/meshBasic1']
	);
	MAT.setName('MAT2');
	assert.deepEqual(
		materials.map((m) => m.pv.material.path()),
		['/MAT2/meshBasic1', '/MAT2/meshBasic1']
	);

	async function checkNewScene(
		sceneToSave: PolyScene,
		matnetwork: MaterialsNetworkObjNode,
		newMatNetworkName: string,
		compute = false
	) {
		const data = new SceneJsonExporter(sceneToSave).data();

		// console.log('************ LOAD **************');
		const scene = await SceneJsonImporter.loadData(data);
		await scene.waitForCooksCompleted();

		const MAT2 = scene.node(matnetwork.path()) as MaterialsNetworkObjNode;
		const materials2 = [scene.node(material1.path()), scene.node(material2.path())] as MaterialSopNode[];
		if (compute) {
			await Promise.all(materials2.map((n) => n.compute())); // with compute
		}
		assert.deepEqual(
			materials2.map((m) => m.pv.material.path()),
			[`/${MAT2.name()}/meshBasic1`, `/${MAT2.name()}/meshBasic1`]
		);
		MAT2.setName(newMatNetworkName);
		assert.deepEqual(
			materials2.map((m) => m.pv.material.path()),
			[`/${MAT2.name()}/meshBasic1`, `/${MAT2.name()}/meshBasic1`]
		);

		return {scene, MAT2};
	}
	const newSceneData = await checkNewScene(scene, MAT, 'MAT3', true);
	await checkNewScene(newSceneData.scene, newSceneData.MAT2, 'MAT4', false);
});
QUnit.test('mutiple params referencing a node with a relative path all get updated', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	await scene.waitForCooksCompleted();

	const MAT = geo1.createNode('materialsNetwork');
	MAT.setName('MAT');
	const meshBasic = MAT.createNode('meshBasic');
	const material1 = geo1.createNode('material');
	const material2 = geo1.createNode('material');
	const materials = [material1, material2];
	materials.forEach((m) => {
		const path = CoreWalker.relativePath(m, meshBasic);
		m.p.material.set(path);
	});

	assert.deepEqual(
		materials.map((m) => m.pv.material.path()),
		['../MAT/meshBasic1', '../MAT/meshBasic1']
	);
	MAT.setName('MAT2');
	assert.deepEqual(
		materials.map((m) => m.pv.material.path()),
		['../MAT2/meshBasic1', '../MAT2/meshBasic1']
	);

	async function checkNewScene(
		sceneToSave: PolyScene,
		matnetwork: MaterialsNetworkSopNode,
		newMatNetworkName: string,
		compute = false
	) {
		const data = new SceneJsonExporter(sceneToSave).data();

		// console.log('************ LOAD **************');
		const scene = await SceneJsonImporter.loadData(data);
		await scene.waitForCooksCompleted();

		const MAT2 = scene.node(matnetwork.path()) as MaterialsNetworkSopNode;
		const materials2 = [scene.node(material1.path()), scene.node(material2.path())] as MaterialSopNode[];
		if (compute) {
			await Promise.all(materials2.map((n) => n.compute())); // with compute
		}
		assert.deepEqual(
			materials2.map((m) => m.pv.material.path()),
			[`../${MAT2.name()}/meshBasic1`, `../${MAT2.name()}/meshBasic1`]
		);
		MAT2.setName(newMatNetworkName);
		assert.deepEqual(
			materials2.map((m) => m.pv.material.path()),
			[`../${MAT2.name()}/meshBasic1`, `../${MAT2.name()}/meshBasic1`]
		);

		return {scene, MAT2};
	}
	const newSceneData = await checkNewScene(scene, MAT, 'MAT3', true);
	await checkNewScene(newSceneData.scene, newSceneData.MAT2, 'MAT4', false);
});

QUnit.test(
	'an operator path param referencing a param gets updated when the param is deleted or added',
	async (assert) => {
		const scene = window.scene;
		const root = scene.root();
		const MAT = window.MAT;
		const event = root.createNode('eventsNetwork');
		const set_param1 = event.createNode('setParam');
		const param_operator_path_param = set_param1.p.param;
		const mesh_basic_builder1 = MAT.createNode('meshBasicBuilder');
		mesh_basic_builder1.createNode('output');
		mesh_basic_builder1.createNode('globals');

		await scene.waitForCooksCompleted();

		param_operator_path_param.set(`${mesh_basic_builder1.path()}/test_param`);
		await param_operator_path_param.compute();
		assert.notOk(param_operator_path_param.value.param());

		const init_params_count = mesh_basic_builder1.params.all.length;
		assert.equal(init_params_count, 36);
		const param1 = mesh_basic_builder1.createNode('param');
		await mesh_basic_builder1.compute();
		assert.equal(mesh_basic_builder1.params.all.length, 37);
		assert.equal(mesh_basic_builder1.params.all[36].name(), 'param1');
		assert.notOk(param_operator_path_param.value.param());

		param1.p.name.set('test_param');
		await mesh_basic_builder1.compute();
		assert.equal(mesh_basic_builder1.params.all[36].name(), 'test_param', 'last param is called test_param');
		assert.ok(param_operator_path_param.value.param(), 'a param is found');
		assert.equal(
			param_operator_path_param.value.param()!.graphNodeId(),
			mesh_basic_builder1.params.get('test_param')!.graphNodeId(),
			'the found param is test_param'
		);
	}
);

QUnit.test(
	'a node path param referencing a non existing node with an absolute path gets linked to it when one matching is named to the path',
	async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		await scene.waitForCooksCompleted();

		const box = geo1.createNode('box');
		geo1.flags.display.set(false);
		box.flags.display.set(true);
		const material1 = geo1.createNode('material');
		material1.p.material.set('/MAT/meshBasic1');
		assert.equal(material1.p.material.type(), ParamType.NODE_PATH);

		// new scene with compute node
		async function testWithCompute() {
			await saveAndLoadScene(scene, async (scene2) => {
				const material2 = scene2.node(material1.path()) as MaterialSopNode;
				assert.equal(material2.pv.material.path(), '/MAT/meshBasic1');

				await material2.compute();
				assert.notOk(material2.pv.material.node());
				const MAT2 = scene2.node(window.MAT.path()) as MaterialsNetworkObjNode;
				const meshBasic1 = MAT2.createNode('meshBasic');
				assert.equal(meshBasic1.path(), material2.pv.material.path());
				assert.ok(material2.pv.material.node());
				assert.equal(material2.pv.material.node()!.graphNodeId(), meshBasic1.graphNodeId());
			});
		}

		// new scene without compute node
		async function testWithoutCompute() {
			await saveAndLoadScene(scene, async (scene2) => {
				const material2 = scene2.node(material1.path()) as MaterialSopNode;
				assert.equal(material2.pv.material.path(), '/MAT/meshBasic1');

				// await material2.compute();
				assert.notOk(material2.pv.material.node());
				const MAT2 = scene2.node(window.MAT.path()) as MaterialsNetworkObjNode;
				const meshBasic1 = MAT2.createNode('meshBasic');
				assert.equal(meshBasic1.path(), material2.pv.material.path());
				assert.ok(material2.pv.material.node());
				assert.equal(material2.pv.material.node()!.graphNodeId(), meshBasic1.graphNodeId());
			});
		}
		await testWithCompute();
		await testWithoutCompute();
	}
);

QUnit.test(
	'a node path param referencing a non existing node with a relative path gets linked to it when one matching is named to the path',
	async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		await scene.waitForCooksCompleted();

		const box = geo1.createNode('box');
		geo1.flags.display.set(false);
		box.flags.display.set(true);
		const material1 = geo1.createNode('material');
		material1.p.material.set('../MAT/meshBasic1');
		assert.equal(material1.p.material.type(), ParamType.NODE_PATH);

		async function testWithCompute() {
			await saveAndLoadScene(scene, async (scene2) => {
				const material2 = scene2.node(material1.path()) as MaterialSopNode;
				assert.equal(material2.pv.material.path(), '../MAT/meshBasic1');

				await material2.compute();
				assert.notOk(material2.pv.material.node());
				const geo2 = scene2.node(geo1.path()) as GeoObjNode;
				const MAT2 = geo2.createNode('materialsNetwork');
				MAT2.setName('MAT');
				const meshBasic1 = MAT2.createNode('meshBasic');
				assert.equal(CoreWalker.relativePath(material2, meshBasic1), material2.pv.material.path());
				assert.ok(material2.pv.material.node());
				assert.equal(material2.pv.material.node()!.graphNodeId(), meshBasic1.graphNodeId());
			});
		}
		async function testWithoutCompute() {
			await saveAndLoadScene(scene, async (scene2) => {
				const material2 = scene2.node(material1.path()) as MaterialSopNode;
				assert.equal(material2.pv.material.path(), '../MAT/meshBasic1');

				await material2.compute();
				assert.notOk(material2.pv.material.node());
				const geo2 = scene2.node(geo1.path()) as GeoObjNode;
				const MAT2 = geo2.createNode('materialsNetwork');
				MAT2.setName('MAT');
				const meshBasic1 = MAT2.createNode('meshBasic');
				assert.equal(CoreWalker.relativePath(material2, meshBasic1), material2.pv.material.path());
				assert.ok(material2.pv.material.node());
				assert.equal(material2.pv.material.node()!.graphNodeId(), meshBasic1.graphNodeId());
			});
		}
		await testWithCompute();
		await testWithoutCompute();
	}
);

// QUnit.test(
// 	'an operator path param referencing a non existing node with an absolute path gets linked to it when one matching is named to the path',
// 	async (assert) => {
// 		const scene = window.scene;
// 		const geo1 = window.geo1;
// 		await scene.waitForCooksCompleted();

// 		const eventsNetwork = scene.root().createNode('eventsNetwork');
// 		const raycast1 = eventsNetwork.createNode('raycast');

// 		const box = geo1.createNode('box');
// 		geo1.flags.display.set(false);
// 		box.flags.display.set(true);
// 		// const objectMerge1 = geo1.createNode('objectMerge');
// 		raycast1.p.camera.set('/geo2/box1');
// 		assert.equal(raycast1.p.camera.type(), ParamType.OPERATOR_PATH);

// 		await saveAndLoadScene(scene, async (scene2) => {
// 			const objectMerge2 = scene2.node(objectMerge1.path()) as ObjectMergeSopNode;
// 			assert.equal(objectMerge2.pv.geometry, '/geo2/box1');

// 			await objectMerge2.compute();
// 			assert.equal(objectMerge2.states.error.message(), `node not found at path '/geo2/box1'`);
// 			const geo2 = scene2.createNode('geo');
// 			const box2 = geo2.createNode('box');
// 			assert.equal(box2.path(), objectMerge2.pv.geometry);
// 			assert.ok(objectMerge2.isDirty());
// 			await objectMerge2.compute();
// 			assert.notOk(objectMerge2.states.error.active());
// 		});
// 	}
// );

// QUnit.test(
// 	'an operator path param referencing a non existing node with a relative path gets linked to it when one matching is named to the path',
// 	async (assert) => {
// 		const scene = window.scene;
// 		const geo1 = window.geo1;
// 		await scene.waitForCooksCompleted();

// 		const box = geo1.createNode('box');
// 		geo1.flags.display.set(false);
// 		box.flags.display.set(true);
// 		const objectMerge1 = geo1.createNode('objectMerge');
// 		objectMerge1.p.geometry.set('../../geo2/box1');
// 		assert.equal(objectMerge1.p.geometry.type(), ParamType.OPERATOR_PATH);

// 		await saveAndLoadScene(scene, async (scene2) => {
// 			const objectMerge2 = scene2.node(objectMerge1.path()) as ObjectMergeSopNode;
// 			assert.equal(objectMerge2.pv.geometry, '../../geo2/box1');

// 			await objectMerge2.compute();
// 			assert.equal(objectMerge2.states.error.message(), `node not found at path '../../geo2/box1'`);
// 			const geo2 = scene2.createNode('geo');
// 			const box2 = geo2.createNode('box');
// 			assert.equal(CoreWalker.relativePath(objectMerge2, box2), objectMerge2.pv.geometry);
// 			assert.ok(objectMerge2.isDirty());
// 			await objectMerge2.compute();
// 			assert.notOk(objectMerge2.states.error.active());
// 		});
// 	}
// );

QUnit.test(
	'referring to a node named image1 will not create conflict when other nodes may be given same name during scene load',
	async (assert) => {
		const scene = window.scene;
		const COP = window.COP;
		const geo1 = window.geo1;
		await scene.waitForCooksCompleted();

		const imageEnvMap = COP.createNode('image');
		imageEnvMap.p.url.set(`${ASSETS_ROOT}/textures/piz_compressed.exr`);
		const envMap = COP.createNode('envMap');
		envMap.setInput(0, imageEnvMap);
		imageEnvMap.setName('imageEnvMap');
		envMap.setName('envMap');
		const imageUv = COP.createNode('image');
		imageUv.p.url.set(`${ASSETS_ROOT}/textures/uv.jpg`);
		imageUv.setName('imageUv');
		const image1 = COP.createNode('image');
		image1.setName('image1');

		assert.equal(imageEnvMap.name(), 'imageEnvMap');
		assert.equal(envMap.name(), 'envMap');
		assert.equal(imageUv.name(), 'imageUv');
		assert.equal(image1.name(), 'image1');

		const sphere1 = geo1.createNode('sphere');
		const material = geo1.createNode('material');
		material.setInput(0, sphere1);
		const MAT = geo1.createNode('materialsNetwork');
		const meshStandard = MAT.createNode('meshStandard');
		meshStandard.p.useEnvMap.set(1);
		meshStandard.p.envMap.set(envMap.path());
		meshStandard.p.useMap.set(1);
		meshStandard.p.map.set(image1.path());

		await saveAndLoadScene(scene, async (scene2) => {
			const meshStandard2 = scene2.node(meshStandard.path()) as MeshStandardMatNode;
			assert.equal(meshStandard2.p.envMap.value.path(), envMap.path());
			assert.equal(meshStandard2.p.map.value.path(), image1.path());
		});
	}
);
