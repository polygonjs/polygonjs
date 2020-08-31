import {AttribClass} from '../../../../src/core/geometry/Constant';
import {AttribPromoteMode} from '../../../../src/engine/nodes/sop/AttribPromote';

QUnit.test('attrib promote vertex to vertex with min', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const attrib_create1 = geo1.create_node('attrib_create');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set('@ptnum');
	attrib_create1.set_input(0, box1);

	const attrib_promote1 = geo1.create_node('attrib_promote');
	attrib_promote1.set_input(0, attrib_create1);
	attrib_promote1.p.class_from.set(AttribClass.VERTEX);
	attrib_promote1.p.class_to.set(AttribClass.VERTEX);
	attrib_promote1.p.mode.set(AttribPromoteMode.MIN);
	attrib_promote1.p.name.set('test');

	let container = await attrib_promote1.request_container();
	const core_group = container.core_content()!;
	const geometry = core_group.objects_with_geo()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	const {array} = geometry.getAttribute('test');
	assert.equal(array.length, container.points_count());
	assert.equal(array[0], 0);
	assert.equal(array[5], 0);
});

QUnit.test('attrib promote vertex to vertex with max', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const attrib_create1 = geo1.create_node('attrib_create');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set('@ptnum');
	attrib_create1.set_input(0, box1);

	const attrib_promote1 = geo1.create_node('attrib_promote');
	attrib_promote1.set_input(0, attrib_create1);
	attrib_promote1.p.class_from.set(AttribClass.VERTEX);
	attrib_promote1.p.class_to.set(AttribClass.VERTEX);
	attrib_promote1.p.mode.set(1); // max
	attrib_promote1.p.name.set('test');

	let container = await attrib_promote1.request_container();
	const core_group = container.core_content()!;
	const geometry = core_group.objects_with_geo()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	const {array} = geometry.getAttribute('test');
	assert.equal(array.length, container.points_count());
	assert.equal(array[0], 23);
	assert.equal(array[5], 23);
});

QUnit.test('attrib promote vertex to object with max', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const attrib_create1 = geo1.create_node('attrib_create');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set('@ptnum');
	attrib_create1.set_input(0, box1);

	const attrib_promote1 = geo1.create_node('attrib_promote');
	attrib_promote1.set_input(0, attrib_create1);
	attrib_promote1.p.class_from.set(AttribClass.VERTEX);
	attrib_promote1.p.class_to.set(AttribClass.OBJECT);
	attrib_promote1.p.mode.set(1); // max
	attrib_promote1.p.name.set('test');

	let container = await attrib_promote1.request_container();
	const core_group = container.core_content()!;
	const object = core_group.objects()[0];
	assert.ok(core_group);
	assert.ok(object);

	assert.deepEqual(object.userData, {attributes: {test: 23}});
});

QUnit.test('attrib promote object to vertex with max', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const attrib_create1 = geo1.create_node('attrib_create');
	attrib_create1.p.class.set(AttribClass.OBJECT);
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set('@ptnum+12');
	attrib_create1.set_input(0, box1);

	const attrib_promote1 = geo1.create_node('attrib_promote');
	attrib_promote1.set_input(0, attrib_create1);
	attrib_promote1.p.class_from.set(AttribClass.OBJECT);
	attrib_promote1.p.class_to.set(AttribClass.VERTEX);
	attrib_promote1.p.mode.set(1); // max
	attrib_promote1.p.name.set('test');

	let container = await attrib_promote1.request_container();
	const core_group = container.core_content()!;
	const geometry = core_group.objects_with_geo()[0].geometry;
	assert.ok(geometry);

	const {array} = geometry.getAttribute('test');
	assert.equal(array.length, container.points_count());
	assert.deepEqual(array[0], 12);
});

QUnit.test('attrib promote multiple attributes from objects to vertex', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const attrib_create1 = geo1.create_node('attrib_create');
	const attrib_create2 = geo1.create_node('attrib_create');
	const attrib_promote1 = geo1.create_node('attrib_promote');
	attrib_create1.p.class.set(AttribClass.OBJECT);
	attrib_create1.p.name.set('id');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set(0.1);
	attrib_create1.set_input(0, box1);

	attrib_create2.p.class.set(AttribClass.OBJECT);
	attrib_create2.p.name.set('role');
	attrib_create2.p.size.set(1);
	attrib_create2.p.value1.set(0.2);
	attrib_create2.set_input(0, attrib_create1);

	attrib_promote1.set_input(0, attrib_create2);
	attrib_promote1.p.class_from.set(AttribClass.OBJECT);
	attrib_promote1.p.class_to.set(AttribClass.VERTEX);
	attrib_promote1.p.mode.set(1); // max
	attrib_promote1.p.name.set('id role');

	let container = await attrib_promote1.request_container();
	const core_group = container.core_content()!;
	const geometry = core_group.objects_with_geo()[0].geometry;
	assert.ok(geometry);

	const array_id = geometry.getAttribute('id').array;
	assert.equal(array_id.length, container.points_count());
	assert.in_delta(array_id[0], 0.1, 0.001);
	const array_role = geometry.getAttribute('role').array;
	assert.equal(array_role.length, container.points_count());
	assert.in_delta(array_role[0], 0.2, 0.001);
});

QUnit.skip('attrib promote from multiple objects to vertex', () => {});
