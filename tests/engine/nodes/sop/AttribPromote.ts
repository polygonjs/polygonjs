import {CoreObject} from './../../../../src/core/geometry/Object';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {AttribPromoteMode} from '../../../../src/engine/operations/sop/AttribPromote';
import {TransformTargetType} from '../../../../src/core/Transform';

QUnit.test('sop/attribPromote vertex to vertex with min', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set('@ptnum');
	attrib_create1.setInput(0, box1);

	const attrib_promote1 = geo1.createNode('attribPromote');
	attrib_promote1.setInput(0, attrib_create1);
	attrib_promote1.setAttribClassFrom(AttribClass.VERTEX);
	attrib_promote1.setAttribClassTo(AttribClass.VERTEX);
	attrib_promote1.setPromoteMode(AttribPromoteMode.MIN);
	attrib_promote1.p.name.set('test');

	let container = await attrib_promote1.compute();
	const core_group = container.coreContent()!;
	const geometry = core_group.objectsWithGeo()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	const {array} = geometry.getAttribute('test');
	assert.equal(array.length, container.pointsCount());
	assert.equal(array[0], 0);
	assert.equal(array[5], 0);
});

QUnit.test('sop/attribPromote vertex to vertex with max', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set('@ptnum');
	attrib_create1.setInput(0, box1);

	const attrib_promote1 = geo1.createNode('attribPromote');
	attrib_promote1.setInput(0, attrib_create1);
	attrib_promote1.setAttribClassFrom(AttribClass.VERTEX);
	attrib_promote1.setAttribClassTo(AttribClass.VERTEX);
	attrib_promote1.setPromoteMode(AttribPromoteMode.MAX); // max
	attrib_promote1.p.name.set('test');

	let container = await attrib_promote1.compute();
	const core_group = container.coreContent()!;
	const geometry = core_group.objectsWithGeo()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	const {array} = geometry.getAttribute('test');
	assert.equal(array.length, container.pointsCount());
	assert.equal(array[0], 23);
	assert.equal(array[5], 23);
});

QUnit.test('sop/attribPromote vertex to object with max', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set('@ptnum');
	attrib_create1.setInput(0, box1);

	const attrib_promote1 = geo1.createNode('attribPromote');
	attrib_promote1.setInput(0, attrib_create1);
	attrib_promote1.setAttribClassFrom(AttribClass.VERTEX);
	attrib_promote1.setAttribClassTo(AttribClass.OBJECT);
	attrib_promote1.setPromoteMode(AttribPromoteMode.MAX); // max
	attrib_promote1.p.name.set('test');

	let container = await attrib_promote1.compute();
	const core_group = container.coreContent()!;
	const object = core_group.objects()[0];
	assert.ok(core_group);
	assert.ok(object);

	assert.deepEqual(object.userData, {attributes: {test: 23}});
});

QUnit.test('sop/attribPromote object to vertex with max', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attribCreate1 = geo1.createNode('attribCreate');
	attribCreate1.setAttribClass(AttribClass.OBJECT);
	attribCreate1.p.name.set('test');
	attribCreate1.p.size.set(1);
	attribCreate1.p.value1.set('@ptnum+12');
	attribCreate1.setInput(0, box1);

	const attribPromote1 = geo1.createNode('attribPromote');
	attribPromote1.setInput(0, attribCreate1);
	attribPromote1.setAttribClassFrom(AttribClass.OBJECT);
	attribPromote1.setAttribClassTo(AttribClass.VERTEX);
	attribPromote1.setPromoteMode(AttribPromoteMode.MAX); // max
	attribPromote1.p.name.set('test');

	let container = await attribPromote1.compute();
	const coreGroup = container.coreContent()!;
	const geometry = coreGroup.objectsWithGeo()[0].geometry;
	assert.ok(geometry);

	const {array} = geometry.getAttribute('test');
	assert.equal(array.length, container.pointsCount());
	assert.deepEqual(array[0], 12);
});

QUnit.test('sop/attribPromote multiple attributes from objects to vertex', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	const attrib_create2 = geo1.createNode('attribCreate');
	const attrib_promote1 = geo1.createNode('attribPromote');
	attrib_create1.setAttribClass(AttribClass.OBJECT);
	attrib_create1.p.name.set('id');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set(0.1);
	attrib_create1.setInput(0, box1);

	attrib_create2.setAttribClass(AttribClass.OBJECT);
	attrib_create2.p.name.set('role');
	attrib_create2.p.size.set(1);
	attrib_create2.p.value1.set(0.2);
	attrib_create2.setInput(0, attrib_create1);

	attrib_promote1.setInput(0, attrib_create2);
	attrib_promote1.setAttribClassFrom(AttribClass.OBJECT);
	attrib_promote1.setAttribClassTo(AttribClass.VERTEX);
	attrib_promote1.setPromoteMode(AttribPromoteMode.MAX); // max
	attrib_promote1.p.name.set('id role');

	let container = await attrib_promote1.compute();
	const core_group = container.coreContent()!;
	const geometry = core_group.objectsWithGeo()[0].geometry;
	assert.ok(geometry);

	const array_id = geometry.getAttribute('id').array;
	assert.equal(array_id.length, container.pointsCount());
	assert.in_delta(array_id[0], 0.1, 0.001);
	const array_role = geometry.getAttribute('role').array;
	assert.equal(array_role.length, container.pointsCount());
	assert.in_delta(array_role[0], 0.2, 0.001);
});

QUnit.test('sop/attribPromote object to object with max', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');
	const box3 = geo1.createNode('box');
	const merge1 = geo1.createNode('merge');
	merge1.setInput(0, box1);
	merge1.setInput(1, box2);
	merge1.setInput(2, box3);

	const attribCreate1 = geo1.createNode('attribCreate');
	attribCreate1.setAttribClass(AttribClass.OBJECT);
	attribCreate1.p.name.set('test');
	attribCreate1.p.size.set(1);
	attribCreate1.p.value1.set('@ptnum');
	attribCreate1.setInput(0, merge1);

	const attribPromote1 = geo1.createNode('attribPromote');
	attribPromote1.setInput(0, attribCreate1);
	attribPromote1.setAttribClassFrom(AttribClass.OBJECT);
	attribPromote1.setAttribClassTo(AttribClass.OBJECT);
	attribPromote1.setPromoteMode(AttribPromoteMode.MAX);
	attribPromote1.p.name.set('test');

	let container = await attribPromote1.compute();
	const coreGroup = container.coreContent()!;
	const coreObjects = coreGroup.coreObjects();
	assert.equal(coreObjects.length, 3);

	assert.deepEqual(
		coreObjects.map((o: CoreObject) => o.attribValue('test')),
		[2, 2, 2]
	);
});

QUnit.test('sop/attribPromote object to object with max (2)', async (assert) => {
	const geo1 = window.geo1;

	const merge1 = geo1.createNode('merge');
	for (let i = 0; i <= 2; i++) {
		const transform = geo1.createNode('transform');
		const box = geo1.createNode('box');
		transform.setInput(0, box);
		transform.setApplyOn(TransformTargetType.OBJECTS);
		transform.p.t.x.set((i + 1) * 2);
		merge1.setInput(i, transform);
	}

	const attribCreate1 = geo1.createNode('attribCreate');
	attribCreate1.setAttribClass(AttribClass.OBJECT);
	attribCreate1.p.name.set('xMin');
	attribCreate1.p.size.set(1);
	attribCreate1.p.value1.set('@P.x');
	attribCreate1.setInput(0, merge1);

	const attribPromote1 = geo1.createNode('attribPromote');
	attribPromote1.setInput(0, attribCreate1);
	attribPromote1.setAttribClassFrom(AttribClass.OBJECT);
	attribPromote1.setAttribClassTo(AttribClass.OBJECT);
	attribPromote1.setPromoteMode(AttribPromoteMode.MAX);
	attribPromote1.p.name.set('xMin');

	let container = await attribPromote1.compute();
	let coreObjects = container.coreContent()!.coreObjects();
	assert.equal(coreObjects.length, 3);
	assert.deepEqual(
		coreObjects.map((o: CoreObject) => o.attribValue('xMin')),
		[6, 6, 6]
	);

	attribPromote1.setPromoteMode(AttribPromoteMode.MIN);
	container = await attribPromote1.compute();
	coreObjects = container.coreContent()!.coreObjects();
	assert.deepEqual(
		coreObjects.map((o: CoreObject) => o.attribValue('xMin')),
		[2, 2, 2]
	);
});

QUnit.skip('attrib promote from multiple objects to vertex', (assert) => {
	assert.equal(1, 2);
});
