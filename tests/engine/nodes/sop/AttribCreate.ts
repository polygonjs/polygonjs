import {CoreConstant} from 'src/core/geometry/Constant';
// import {GeometryContainer} from 'src/engine/containers/Geometry';

QUnit.test('attrib create simple float vertex', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const attrib_create1 = geo1.create_node('attrib_create');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set(3.5);
	attrib_create1.set_input(0, box1);

	let container = await attrib_create1.request_container();
	const core_group = container.core_content()!;
	const geometry = core_group.objects()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	const {array} = geometry.getAttribute('test');
	assert.equal(array.length, container.points_count());
	assert.equal(array[0], 3.5);

	const cloned_geo = geometry.clone();
	const cloned_array = cloned_geo.getAttribute('test').array;
	assert.equal(cloned_array.length, container.points_count());
	assert.equal(cloned_array[0], 3.5);
});

QUnit.test('attrib create expression float vertex', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const attrib_create1 = geo1.create_node('attrib_create');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set('(@ptnum+1)*3');
	attrib_create1.set_input(0, box1);

	const container = await attrib_create1.request_container();
	const core_group = container.core_content()!;
	const geometry = core_group.objects()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	const {array} = geometry.getAttribute('test');
	assert.equal(array.length, container.points_count());
	assert.equal(array[0], 3);
	assert.equal(array[1], 6);
	assert.equal(array[2], 9);
});

QUnit.test('attrib create expression float vertex from position', async (assert) => {
	const geo1 = window.geo1;

	const sphere1 = geo1.create_node('sphere');
	const attrib_create1 = geo1.create_node('attrib_create');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set('@P.y > 0');
	attrib_create1.set_input(0, sphere1);

	const container = await attrib_create1.request_container();
	const core_group = container.core_content()!;
	const geometry = core_group.objects()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	const {array} = geometry.getAttribute('test');
	assert.equal(array.length, container.points_count());
	assert.equal(array[0], 1);
	assert.equal(array[1], 1);
	assert.equal(array[2], 1);
	assert.equal(array[array.length - 1], 0);
	assert.equal(array[array.length - 2], 0);
});

QUnit.test('attrib create expression from a non existing attribute', async (assert) => {
	const geo1 = window.geo1;

	const sphere1 = geo1.create_node('sphere');
	const attrib_create1 = geo1.create_node('attrib_create');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set('@doesnotexist > 0');
	attrib_create1.set_input(0, sphere1);

	await attrib_create1.request_container();
	assert.ok(attrib_create1.states.error.active);
	assert.equal(attrib_create1.states.error.message, 'expression evalution error: Error: attribute not found');

	attrib_create1.p.value1.set('@P.y > 0');
	await attrib_create1.request_container();
	assert.ok(!attrib_create1.states.error.active);
});

QUnit.test('attrib create simple vector2 vertex', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const attrib_create1 = geo1.create_node('attrib_create');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(2);
	attrib_create1.p.value2.set([3.5, 5]);
	attrib_create1.set_input(0, box1);

	const container = await attrib_create1.request_container();
	const core_group = container.core_content()!;
	const geometry = core_group.objects()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	const {array} = geometry.getAttribute('test');

	assert.equal(array.length, container.points_count() * 2);
	assert.equal(array[0], 3.5);
	assert.equal(array[1], 5);
	assert.equal(array[2], 3.5);
	assert.equal(array[3], 5);
	assert.equal(array[4], 3.5);
	assert.equal(array[5], 5);
});

QUnit.test('attrib create simple vector vertex', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const attrib_create1 = geo1.create_node('attrib_create');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(3);
	attrib_create1.p.value3.set([3.5, 5, 8]);
	attrib_create1.set_input(0, box1);

	const container = await attrib_create1.request_container();
	const core_group = container.core_content()!;
	const geometry = core_group.objects()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	const {array} = geometry.getAttribute('test');

	assert.equal(array.length, container.points_count() * 3);
	assert.equal(array[0], 3.5);
	assert.equal(array[1], 5);
	assert.equal(array[2], 8);
	assert.equal(array[3], 3.5);
});

QUnit.test('attrib create expression vector vertex', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.create_node('plane');
	const attrib_create1 = geo1.create_node('attrib_create');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(3);
	attrib_create1.p.value3.set([1, 2, 3]);
	attrib_create1.p.value3.x.set('@ptnum');
	attrib_create1.set_input(0, plane1);

	const container = await attrib_create1.request_container();
	const core_group = container.core_content()!;
	const geometry = core_group.objects()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	const {array} = geometry.getAttribute('test');

	assert.equal(array.length, container.points_count() * 3);
	assert.equal(array[0], 0);
	assert.equal(array[3], 1);
	assert.equal(array[6], 2);
	assert.equal(array[9], 3);
});

QUnit.test('attrib create on existing attrib vector2 uv', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.create_node('plane');
	const attrib_create1 = geo1.create_node('attrib_create');
	attrib_create1.p.name.set('uv');
	attrib_create1.p.size.set(2);
	attrib_create1.p.value2.x.set('@uv.x*2');
	attrib_create1.p.value2.y.set('@uv.y*2');
	attrib_create1.set_input(0, plane1);

	let container, core_group, geometry, array;
	container = await attrib_create1.request_container();
	core_group = container.core_content()!;
	geometry = core_group.objects()[0].geometry;
	array = geometry.getAttribute('uv').array as number[];
	assert.ok(core_group);
	assert.ok(geometry);

	assert.equal(array.length, container.points_count() * 2);
	assert.equal(array.join(','), [0, 2, 2, 2, 0, 0, 2, 0].join(','));

	attrib_create1.p.value2.x.set('@uv.y');
	attrib_create1.p.value2.y.set('@uv.x');
	container = await attrib_create1.request_container();
	core_group = container.core_content()!;
	geometry = core_group.objects()[0].geometry;
	array = geometry.getAttribute('uv').array as number[];
	assert.equal(array.join(','), [1, 0, 1, 1, 0, 0, 0, 1].join(','));
});

QUnit.test('attrib create simple float object', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const attrib_create1 = geo1.create_node('attrib_create');
	attrib_create1.p.name.set('test');
	attrib_create1.p.class.set(CoreConstant.ATTRIB_CLASS.OBJECT);
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set(3.5);
	attrib_create1.set_input(0, box1);

	const container = await attrib_create1.request_container();
	const core_group = container.core_content()!;
	const object = core_group.objects()[0];
	assert.ok(object);

	assert.deepEqual(object.userData, {attributes: {test: 3.5}});
});

QUnit.test('attrib create simple vector2 object', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const attrib_create1 = geo1.create_node('attrib_create');
	attrib_create1.p.name.set('test');
	attrib_create1.p.class.set(CoreConstant.ATTRIB_CLASS.OBJECT);
	attrib_create1.p.size.set(2);
	attrib_create1.p.value2.set([3.5, 12]);
	attrib_create1.set_input(0, box1);

	let container = await attrib_create1.request_container();
	let core_group = container.core_content()!;
	let object = core_group.objects()[0];
	assert.ok(core_group);
	assert.ok(object);

	assert.deepEqual(object.userData, {attributes: {test: [3.5, 12]}});

	attrib_create1.p.value2.x.set('$F*2+1.5');
	scene.set_frame(10);
	assert.ok(attrib_create1.p.value2.x.is_dirty);
	assert.ok(attrib_create1.p.value2.is_dirty);
	assert.ok(attrib_create1.is_dirty);
	container = await attrib_create1.request_container();
	core_group = container.core_content()!;
	object = core_group.objects()[0];
	assert.deepEqual(object.userData, {attributes: {test: [21.5, 12]}});
});

QUnit.test('attrib create simple vector object', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const attrib_create1 = geo1.create_node('attrib_create');
	attrib_create1.p.name.set('test');
	attrib_create1.p.class.set(CoreConstant.ATTRIB_CLASS.OBJECT);
	attrib_create1.p.size.set(3);
	attrib_create1.p.value3.set([3.5, 12, 17]);
	attrib_create1.set_input(0, box1);

	const container = await attrib_create1.request_container();
	const core_group = container.core_content()!;
	const object = core_group.objects()[0];
	assert.ok(core_group);
	assert.ok(object);

	assert.deepEqual(object.userData, {attributes: {test: [3.5, 12, 17]}});
});

QUnit.test('attrib create simple string object', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const attrib_create1 = geo1.create_node('attrib_create');
	attrib_create1.p.name.set('test_string');
	attrib_create1.p.class.set(CoreConstant.ATTRIB_CLASS.OBJECT);
	attrib_create1.p.size.set(1);
	attrib_create1.p.type.set(CoreConstant.ATTRIB_TYPE.STRING);
	attrib_create1.p.string.set('pt_`$F`');
	attrib_create1.set_input(0, box1);

	let container = await attrib_create1.request_container();
	let core_group = container.core_content()!;
	let object = core_group.objects()[0];
	assert.ok(core_group);
	assert.ok(object);

	assert.deepEqual(object.userData, {attributes: {test_string: 'pt_1'}});

	scene.set_frame(12);
	container = await attrib_create1.request_container();
	core_group = container.core_content()!;
	object = core_group.objects()[0];
	assert.deepEqual(object.userData, {attributes: {test_string: 'pt_12'}});

	attrib_create1.p.string.set('`$F*2`');
	container = await attrib_create1.request_container();
	core_group = container.core_content()!;
	object = core_group.objects()[0];
	assert.deepEqual(object.userData, {attributes: {test_string: '24'}});
});

QUnit.test('attrib create for many points completes in reasonable time', async (assert) => {
	const geo1 = window.geo1;

	window.scene.performance.start();

	const box1 = geo1.create_node('box');
	const bbox_scatter1 = geo1.create_node('bbox_scatter');
	bbox_scatter1.set_input(0, box1);
	bbox_scatter1.p.step_size.set(0.5);
	const attrib_create1 = geo1.create_node('attrib_create');
	attrib_create1.set_input(0, bbox_scatter1);

	attrib_create1.p.name.set('ptid');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set('@ptnum');

	let container;
	container = await bbox_scatter1.request_container();
	let core_group = container.core_content()!;
	assert.equal(core_group.points().length, 8);
	assert.less_than(bbox_scatter1.cook_controller.cook_time, 20);

	container = await attrib_create1.request_container();
	core_group = container.core_content()!;
	assert.less_than(attrib_create1.cook_controller.cook_time, 20);

	const point = core_group.points()[3];
	assert.equal(point.attrib_value('ptid'), 3);

	bbox_scatter1.p.step_size.set(0.1);
	container = await attrib_create1.request_container();
	core_group = container.core_content()!;
	assert.equal(core_group.points().length, 1000);

	assert.less_than(attrib_create1.cook_controller.cook_time, 80);

	window.scene.performance.stop();
});

QUnit.test('attrib create for string on vertices', async (assert) => {
	const geo1 = window.geo1;

	window.scene.performance.start();

	const box1 = geo1.create_node('box');
	const attrib_create1 = geo1.create_node('attrib_create');
	attrib_create1.set_input(0, box1);
	attrib_create1.p.name.set('ids');
	attrib_create1.p.type.set(CoreConstant.ATTRIB_TYPE.STRING);
	attrib_create1.p.string.set('pt_`@ptnum*2`');

	let container = await attrib_create1.request_container();
	assert.equal(container.points_count(), 24, 'has 24 pts');
	let points = container.core_content()!.points();
	assert.equal(points[0].attrib_value('ids'), 'pt_0', 'pt 0 has pt_0');
	assert.equal(points[1].attrib_value('ids'), 'pt_2', 'pt 1 has pt_2');
	assert.equal(points[2].attrib_value('ids'), 'pt_4', 'pt 2 has pt_4');

	attrib_create1.p.string.set('`@ptnum*2`_pt');
	container = await attrib_create1.request_container();
	points = container.core_content()!.points();
	assert.equal(points[0].attrib_value('ids'), '0_pt', 'pt 0 has 0_pt');
	assert.equal(points[1].attrib_value('ids'), '2_pt', 'pt 1 has 2_pt');
	assert.equal(points[2].attrib_value('ids'), '4_pt', 'pt 2 has 4_pt');

	attrib_create1.p.string.set('`@ptnum*2`');
	container = await attrib_create1.request_container();
	points = container.core_content()!.points();
	assert.equal(points[0].attrib_value('ids'), '0');
	assert.equal(points[1].attrib_value('ids'), '2');
	assert.equal(points[2].attrib_value('ids'), '4');
});
