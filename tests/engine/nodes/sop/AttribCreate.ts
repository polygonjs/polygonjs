import {CoreConstant, AttribType} from '../../../../src/core/geometry/Constant';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {AttribCreateSopNode} from '../../../../src/engine/nodes/sop/AttribCreate';

QUnit.test('attrib create simple float vertex', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set(3.5);
	attrib_create1.setInput(0, box1);

	let container = await attrib_create1.requestContainer();
	const core_group = container.coreContent()!;
	const geometry = core_group.objectsWithGeo()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	const {array} = geometry.getAttribute('test');
	assert.equal(array.length, container.pointsCount());
	assert.equal(array[0], 3.5);

	const cloned_geo = geometry.clone();
	const cloned_array = cloned_geo.getAttribute('test').array;
	assert.equal(cloned_array.length, container.pointsCount());
	assert.equal(cloned_array[0], 3.5);
});

QUnit.test('attrib create expression float vertex', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set('(@ptnum+1)*3');
	attrib_create1.setInput(0, box1);

	const container = await attrib_create1.requestContainer();
	const core_group = container.coreContent()!;
	const geometry = core_group.objectsWithGeo()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	const {array} = geometry.getAttribute('test');
	assert.equal(array.length, container.pointsCount());
	assert.equal(array[0], 3);
	assert.equal(array[1], 6);
	assert.equal(array[2], 9);
});

QUnit.test('attrib create expression float vertex from position', async (assert) => {
	const geo1 = window.geo1;

	const sphere1 = geo1.createNode('sphere');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set('@P.y > 0');
	attrib_create1.setInput(0, sphere1);

	const container = await attrib_create1.requestContainer();
	const core_group = container.coreContent()!;
	const geometry = core_group.objectsWithGeo()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	const {array} = geometry.getAttribute('test');
	assert.equal(array.length, container.pointsCount());
	assert.equal(array[0], 1);
	assert.equal(array[1], 1);
	assert.equal(array[2], 1);
	assert.equal(array[array.length - 1], 0);
	assert.equal(array[array.length - 2], 0);
});

QUnit.test('attrib create expression from a non existing attribute', async (assert) => {
	const geo1 = window.geo1;

	const sphere1 = geo1.createNode('sphere');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set('@doesnotexist > 0');
	attrib_create1.setInput(0, sphere1);

	await attrib_create1.requestContainer();
	assert.ok(attrib_create1.states.error.active());
	assert.equal(attrib_create1.states.error.message(), 'expression evalution error: attribute not found');

	attrib_create1.p.value1.set('@P.y > 0');
	await attrib_create1.requestContainer();
	assert.ok(!attrib_create1.states.error.active());
});

QUnit.test('attrib create simple vector2 vertex', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(2);
	attrib_create1.p.value2.set([3.5, 5]);
	attrib_create1.setInput(0, box1);

	const container = await attrib_create1.requestContainer();
	const core_group = container.coreContent()!;
	const geometry = core_group.objectsWithGeo()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	const {array} = geometry.getAttribute('test');

	assert.equal(array.length, container.pointsCount() * 2);
	assert.equal(array[0], 3.5);
	assert.equal(array[1], 5);
	assert.equal(array[2], 3.5);
	assert.equal(array[3], 5);
	assert.equal(array[4], 3.5);
	assert.equal(array[5], 5);
});

QUnit.test('attrib create simple vector vertex', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(3);
	attrib_create1.p.value3.set([3.5, 5, 8]);
	attrib_create1.setInput(0, box1);

	const container = await attrib_create1.requestContainer();
	const core_group = container.coreContent()!;
	const geometry = core_group.objectsWithGeo()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	const {array} = geometry.getAttribute('test');

	assert.equal(array.length, container.pointsCount() * 3);
	assert.equal(array[0], 3.5);
	assert.equal(array[1], 5);
	assert.equal(array[2], 8);
	assert.equal(array[3], 3.5);
});

QUnit.test('attrib create expression vector vertex', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(3);
	attrib_create1.p.value3.set([1, 2, 3]);
	attrib_create1.p.value3.x.set('@ptnum');
	attrib_create1.setInput(0, plane1);

	let container = await attrib_create1.requestContainer();
	let core_group = container.coreContent()!;
	let geometry = core_group.objectsWithGeo()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	let array = geometry.getAttribute('test').array;

	assert.equal(array.length, container.pointsCount() * 3);
	assert.equal(array[0], 0);
	assert.equal(array[3], 1);
	assert.equal(array[6], 2);
	assert.equal(array[9], 3);

	// test to make sure it can reload with an expression on a vector
	const scene = window.scene;
	const data = new SceneJsonExporter(scene).data();
	console.log('************ LOAD **************');
	const scene2 = await SceneJsonImporter.loadData(data);
	await scene2.waitForCooksCompleted();
	const attrib_create2 = scene2.node(attrib_create1.fullPath()) as AttribCreateSopNode;
	container = await attrib_create2.requestContainer();
	core_group = container.coreContent()!;
	geometry = core_group.objectsWithGeo()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	array = geometry.getAttribute('test').array;

	assert.equal(array.length, container.pointsCount() * 3);
	assert.equal(array[0], 0);
	assert.equal(array[3], 1);
	assert.equal(array[6], 2);
	assert.equal(array[9], 3);
});

QUnit.test('attrib create on existing attrib vector2 uv', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('uv');
	attrib_create1.p.size.set(2);
	attrib_create1.p.value2.x.set('@uv.x*2');
	attrib_create1.p.value2.y.set('@uv.y*2');
	attrib_create1.setInput(0, plane1);

	let container, core_group, geometry, array;
	container = await attrib_create1.requestContainer();
	core_group = container.coreContent()!;
	geometry = core_group.objectsWithGeo()[0].geometry;
	array = geometry.getAttribute('uv').array as number[];
	assert.ok(core_group);
	assert.ok(geometry);

	assert.equal(array.length, container.pointsCount() * 2);
	assert.equal(array.join(','), [0, 2, 2, 2, 0, 0, 2, 0].join(','));

	attrib_create1.p.value2.x.set('@uv.y');
	attrib_create1.p.value2.y.set('@uv.x');
	container = await attrib_create1.requestContainer();
	core_group = container.coreContent()!;
	geometry = core_group.objectsWithGeo()[0].geometry;
	array = geometry.getAttribute('uv').array as number[];
	assert.equal(array.join(','), [1, 0, 1, 1, 0, 0, 0, 1].join(','));
});

QUnit.test('attrib create simple float object', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('test');
	attrib_create1.p.class.set(CoreConstant.ATTRIB_CLASS.OBJECT);
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set(3.5);
	attrib_create1.setInput(0, box1);

	const container = await attrib_create1.requestContainer();
	const core_group = container.coreContent()!;
	const object = core_group.objects()[0];
	assert.ok(object);

	assert.deepEqual(object.userData, {attributes: {test: 3.5}});
});

QUnit.test('attrib create simple vector2 object', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('test');
	attrib_create1.p.class.set(CoreConstant.ATTRIB_CLASS.OBJECT);
	attrib_create1.p.size.set(2);
	attrib_create1.p.value2.set([3.5, 12]);
	attrib_create1.setInput(0, box1);

	let container = await attrib_create1.requestContainer();
	let core_group = container.coreContent()!;
	let object = core_group.objects()[0];
	assert.ok(core_group);
	assert.ok(object);

	assert.deepEqual(object.userData, {attributes: {test: [3.5, 12]}});

	attrib_create1.p.value2.x.set('$F*2+1.5');
	scene.setFrame(10);
	assert.ok(attrib_create1.p.value2.x.isDirty());
	assert.ok(attrib_create1.p.value2.isDirty());
	assert.ok(attrib_create1.isDirty());
	container = await attrib_create1.requestContainer();
	core_group = container.coreContent()!;
	object = core_group.objects()[0];
	assert.deepEqual(object.userData, {attributes: {test: [21.5, 12]}});
});

QUnit.test('attrib create simple vector object', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('test');
	attrib_create1.p.class.set(CoreConstant.ATTRIB_CLASS.OBJECT);
	attrib_create1.p.size.set(3);
	attrib_create1.p.value3.set([3.5, 12, 17]);
	attrib_create1.setInput(0, box1);

	const container = await attrib_create1.requestContainer();
	const core_group = container.coreContent()!;
	const object = core_group.objects()[0];
	assert.ok(core_group);
	assert.ok(object);

	assert.deepEqual(object.userData, {attributes: {test: [3.5, 12, 17]}});
});

QUnit.test('attrib create simple string object', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('test_string');
	attrib_create1.p.class.set(CoreConstant.ATTRIB_CLASS.OBJECT);
	attrib_create1.p.size.set(1);
	attrib_create1.p.type.set(AttribType.STRING);
	attrib_create1.p.string.set('pt_`$F`');
	attrib_create1.setInput(0, box1);

	let container = await attrib_create1.requestContainer();
	let core_group = container.coreContent()!;
	let object = core_group.objects()[0];
	assert.ok(core_group);
	assert.ok(object);

	assert.deepEqual(object.userData, {attributes: {test_string: 'pt_1'}});

	scene.setFrame(12);
	container = await attrib_create1.requestContainer();
	core_group = container.coreContent()!;
	object = core_group.objects()[0];
	assert.deepEqual(object.userData, {attributes: {test_string: 'pt_12'}});

	attrib_create1.p.string.set('`$F*2`');
	container = await attrib_create1.requestContainer();
	core_group = container.coreContent()!;
	object = core_group.objects()[0];
	assert.deepEqual(object.userData, {attributes: {test_string: '24'}});
});

QUnit.test('attrib create for many points completes in reasonable time', async (assert) => {
	const geo1 = window.geo1;

	window.scene.performance.start();

	const box1 = geo1.createNode('box');
	const bbox_scatter1 = geo1.createNode('bboxScatter');
	bbox_scatter1.setInput(0, box1);
	bbox_scatter1.p.stepSize.set(0.5);
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.setInput(0, bbox_scatter1);

	attrib_create1.p.name.set('ptid');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set('@ptnum');

	let container;
	container = await bbox_scatter1.requestContainer();
	let core_group = container.coreContent()!;
	assert.equal(core_group.points().length, 8);
	assert.less_than(bbox_scatter1.cook_controller.cook_time, 20);

	container = await attrib_create1.requestContainer();
	core_group = container.coreContent()!;
	assert.less_than(attrib_create1.cook_controller.cook_time, 20);

	const point = core_group.points()[3];
	assert.equal(point.attribValue('ptid'), 3);

	bbox_scatter1.p.stepSize.set(0.1);
	container = await attrib_create1.requestContainer();
	core_group = container.coreContent()!;
	assert.equal(core_group.points().length, 1000);

	assert.less_than(attrib_create1.cook_controller.cook_time, 80);

	window.scene.performance.stop();

	// test to make sure it can reload with an expression
	const scene = window.scene;
	const data = new SceneJsonExporter(scene).data();
	console.log('************ LOAD **************');
	const scene2 = await SceneJsonImporter.loadData(data);
	await scene2.waitForCooksCompleted();
	const attrib_create2 = scene2.node(attrib_create1.fullPath()) as AttribCreateSopNode;
	container = await attrib_create2.requestContainer();
	core_group = container.coreContent()!;
	assert.equal(core_group.points().length, 1000);
});

QUnit.test('attrib create for string on vertices with expr', async (assert) => {
	const geo1 = window.geo1;

	window.scene.performance.start();

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.setInput(0, box1);
	attrib_create1.p.name.set('ids');
	attrib_create1.p.type.set(AttribType.STRING);
	attrib_create1.p.string.set('pt_`@ptnum*2`');

	let container = await attrib_create1.requestContainer();
	assert.equal(container.pointsCount(), 24, 'has 24 pts');
	let points = container.coreContent()!.points();
	assert.equal(points[0].attribValue('ids'), 'pt_0', 'pt 0 has pt_0');
	assert.equal(points[1].attribValue('ids'), 'pt_2', 'pt 1 has pt_2');
	assert.equal(points[2].attribValue('ids'), 'pt_4', 'pt 2 has pt_4');

	attrib_create1.p.string.set('`@ptnum*2`_pt');
	container = await attrib_create1.requestContainer();
	points = container.coreContent()!.points();
	assert.equal(points[0].attribValue('ids'), '0_pt', 'pt 0 has 0_pt');
	assert.equal(points[1].attribValue('ids'), '2_pt', 'pt 1 has 2_pt');
	assert.equal(points[2].attribValue('ids'), '4_pt', 'pt 2 has 4_pt');

	attrib_create1.p.string.set('`@ptnum*2`');
	container = await attrib_create1.requestContainer();
	points = container.coreContent()!.points();
	assert.equal(points[0].attribValue('ids'), '0');
	assert.equal(points[1].attribValue('ids'), '2');
	assert.equal(points[2].attribValue('ids'), '4');
});

QUnit.test('attrib create for string on vertices without expr', async (assert) => {
	const geo1 = window.geo1;

	window.scene.performance.start();

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.setInput(0, box1);
	attrib_create1.p.name.set('ids');
	attrib_create1.p.type.set(AttribType.STRING);
	attrib_create1.p.string.set('test');

	let container = await attrib_create1.requestContainer();
	assert.equal(container.pointsCount(), 24, 'has 24 pts');
	let points = container.coreContent()!.points();
	assert.equal(points[0].attribValue('ids'), 'test', 'pt 0 has pt_0');
	assert.equal(points[1].attribValue('ids'), 'test', 'pt 1 has pt_2');
	assert.equal(points[2].attribValue('ids'), 'test', 'pt 2 has pt_4');

	const geometry = container.coreContent()!.objectsWithGeo()[0].geometry;
	const array = geometry.getAttribute('ids').array;
	assert.equal(array.length, 24);
	assert.equal(array[0], 0);
	assert.equal(array[1], 0);
	assert.equal(array[2], 0);
});
