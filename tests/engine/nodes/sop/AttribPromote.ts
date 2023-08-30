import type {QUnit} from '../../../helpers/QUnit';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {AttribPromoteMode} from '../../../../src/engine/operations/sop/AttribPromote';
import {TransformTargetType} from '../../../../src/core/Transform';
import {BufferAttribute} from 'three';
import {CoreObjectType} from '../../../../src/core/geometry/ObjectContent';
import {BaseCoreObject} from '../../../../src/core/geometry/_BaseObject';
export function testenginenodessopAttribPromote(qUnit: QUnit) {
	qUnit.test('sop/attribPromote point to point with min', async (assert) => {
		const geo1 = window.geo1;

		const box1 = geo1.createNode('box');
		const attrib_create1 = geo1.createNode('attribCreate');
		attrib_create1.p.name.set('test');
		attrib_create1.p.size.set(1);
		attrib_create1.p.value1.set('@ptnum');
		attrib_create1.setInput(0, box1);

		const attrib_promote1 = geo1.createNode('attribPromote');
		attrib_promote1.setInput(0, attrib_create1);
		attrib_promote1.setAttribClassFrom(AttribClass.POINT);
		attrib_promote1.setAttribClassTo(AttribClass.POINT);
		attrib_promote1.setPromoteMode(AttribPromoteMode.MIN);
		attrib_promote1.p.name.set('test');

		let container = await attrib_promote1.compute();
		const core_group = container.coreContent()!;
		const geometry = core_group.threejsObjectsWithGeo()[0].geometry;
		assert.ok(core_group);
		assert.ok(geometry);

		const {array} = geometry.getAttribute('test') as BufferAttribute;
		assert.equal(array.length, container.pointsCount());
		assert.equal(array[0], 0);
		assert.equal(array[5], 0);
	});

	qUnit.test('sop/attribPromote point to point with max', async (assert) => {
		const geo1 = window.geo1;

		const box1 = geo1.createNode('box');
		const attrib_create1 = geo1.createNode('attribCreate');
		attrib_create1.p.name.set('test');
		attrib_create1.p.size.set(1);
		attrib_create1.p.value1.set('@ptnum');
		attrib_create1.setInput(0, box1);

		const attrib_promote1 = geo1.createNode('attribPromote');
		attrib_promote1.setInput(0, attrib_create1);
		attrib_promote1.setAttribClassFrom(AttribClass.POINT);
		attrib_promote1.setAttribClassTo(AttribClass.POINT);
		attrib_promote1.setPromoteMode(AttribPromoteMode.MAX); // max
		attrib_promote1.p.name.set('test');

		let container = await attrib_promote1.compute();
		const core_group = container.coreContent()!;
		const geometry = core_group.threejsObjectsWithGeo()[0].geometry;
		assert.ok(core_group);
		assert.ok(geometry);

		const {array} = geometry.getAttribute('test') as BufferAttribute;
		assert.equal(array.length, container.pointsCount());
		assert.equal(array[0], 23);
		assert.equal(array[5], 23);
	});

	qUnit.test('sop/attribPromote point to object with max', async (assert) => {
		const geo1 = window.geo1;

		const box1 = geo1.createNode('box');
		const attrib_create1 = geo1.createNode('attribCreate');
		attrib_create1.p.name.set('test');
		attrib_create1.p.size.set(1);
		attrib_create1.p.value1.set('@ptnum');
		attrib_create1.setInput(0, box1);

		const attrib_promote1 = geo1.createNode('attribPromote');
		attrib_promote1.setInput(0, attrib_create1);
		attrib_promote1.setAttribClassFrom(AttribClass.POINT);
		attrib_promote1.setAttribClassTo(AttribClass.OBJECT);
		attrib_promote1.setPromoteMode(AttribPromoteMode.MAX); // max
		attrib_promote1.p.name.set('test');

		let container = await attrib_promote1.compute();
		const core_group = container.coreContent()!;
		const object = core_group.allObjects()[0];
		assert.ok(core_group);
		assert.ok(object);

		assert.deepEqual(object.userData, {attributes: {test: 23}});
	});

	qUnit.test('sop/attribPromote object to point with max', async (assert) => {
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
		attribPromote1.setAttribClassTo(AttribClass.POINT);
		attribPromote1.setPromoteMode(AttribPromoteMode.MAX); // max
		attribPromote1.p.name.set('test');

		let container = await attribPromote1.compute();
		const coreGroup = container.coreContent()!;
		const geometry = coreGroup.threejsObjectsWithGeo()[0].geometry;
		assert.ok(geometry);

		const {array} = geometry.getAttribute('test') as BufferAttribute;
		assert.equal(array.length, container.pointsCount());
		assert.deepEqual(array[0], 12);
	});

	qUnit.test('sop/attribPromote multiple attributes from objects to point', async (assert) => {
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
		attrib_promote1.setAttribClassTo(AttribClass.POINT);
		attrib_promote1.setPromoteMode(AttribPromoteMode.MAX); // max
		attrib_promote1.p.name.set('id role');

		let container = await attrib_promote1.compute();
		const core_group = container.coreContent()!;
		const geometry = core_group.threejsObjectsWithGeo()[0].geometry;
		assert.ok(geometry);

		const array_id = (geometry.getAttribute('id') as BufferAttribute).array;
		assert.equal(array_id.length, container.pointsCount());
		assert.in_delta(array_id[0], 0.1, 0.001);
		const array_role = (geometry.getAttribute('role') as BufferAttribute).array;
		assert.equal(array_role.length, container.pointsCount());
		assert.in_delta(array_role[0], 0.2, 0.001);
	});

	qUnit.test('sop/attribPromote object to object with max', async (assert) => {
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
		const coreObjects = coreGroup.allCoreObjects();
		assert.equal(coreObjects.length, 3);

		assert.deepEqual(
			coreObjects.map((o: BaseCoreObject<CoreObjectType>) => o.attribValue('test')),
			[2, 2, 2]
		);
	});

	qUnit.test('sop/attribPromote object to object with max (2)', async (assert) => {
		const geo1 = window.geo1;

		const merge1 = geo1.createNode('merge');
		for (let i = 0; i <= 2; i++) {
			const transform = geo1.createNode('transform');
			const box = geo1.createNode('box');
			transform.setInput(0, box);
			transform.setApplyOn(TransformTargetType.OBJECT);
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
		let coreObjects = container.coreContent()!.allCoreObjects();
		assert.equal(coreObjects.length, 3);
		assert.deepEqual(
			coreObjects.map((o: BaseCoreObject<CoreObjectType>) => o.attribValue('xMin')),
			[6, 6, 6]
		);

		attribPromote1.setPromoteMode(AttribPromoteMode.MIN);
		container = await attribPromote1.compute();
		coreObjects = container.coreContent()!.allCoreObjects();
		assert.deepEqual(
			coreObjects.map((o: BaseCoreObject<CoreObjectType>) => o.attribValue('xMin')),
			[2, 2, 2]
		);
	});

	qUnit.skip('attrib promote from multiple objects to vertex', (assert) => {
		assert.equal(1, 2);
	});
}
