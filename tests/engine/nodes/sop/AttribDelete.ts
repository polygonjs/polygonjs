import type {QUnit} from '../../../helpers/QUnit';
import {AttribClass} from '../../../../src/core/geometry/Constant';
export function testenginenodessopAttribDelete(qUnit: QUnit) {
	qUnit.test('sop/attribDelete simple point', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const attribCreate1 = geo1.createNode('attribCreate');
		const attribDelete1 = geo1.createNode('attribDelete');
		attribCreate1.setInput(0, plane1);
		attribDelete1.setInput(0, attribCreate1);

		attribCreate1.p.name.set('test');
		attribCreate1.p.value1.set('@ptnum');
		attribDelete1.p.name.set('test');
		attribDelete1.setAttribClass(AttribClass.POINT);

		let container = await attribCreate1.compute();
		assert.notOk(attribCreate1.states.error.active());
		assert.notOk(attribCreate1.states.error.message());
		let coreGroup = container.coreContent()!;
		let geometry = coreGroup.threejsObjectsWithGeo()[0].geometry;
		assert.ok(geometry.getAttribute('test') != null);

		container = await attribDelete1.compute();
		assert.notOk(attribDelete1.states.error.active());
		assert.notOk(attribDelete1.states.error.message());
		coreGroup = container.coreContent()!;
		geometry = coreGroup.threejsObjectsWithGeo()[0].geometry;
		assert.notOk(geometry.getAttribute('test') != null);
	});

	qUnit.test('sop/attribDelete simple object', async (assert) => {
		const geo1 = window.geo1;
		const plane1 = geo1.createNode('plane');

		const attribCreate1 = geo1.createNode('attribCreate');
		attribCreate1.setInput(0, plane1);
		attribCreate1.setAttribClass(AttribClass.OBJECT);
		attribCreate1.p.name.set('test');
		attribCreate1.p.value1.set(2);

		let container = await attribCreate1.compute();
		assert.notOk(attribCreate1.states.error.active());
		assert.notOk(attribCreate1.states.error.message());
		let coreGroup = container.coreContent()!;
		let coreObject = coreGroup.allCoreObjects()[0];
		assert.equal(coreObject.attribValue('test'), 2);
		assert.deepEqual(coreObject.attribNames(), ['test']);

		const attribDelete1 = geo1.createNode('attribDelete');
		attribDelete1.p.name.set('test');
		attribDelete1.setAttribClass(AttribClass.OBJECT);
		attribDelete1.setInput(0, attribCreate1);

		container = await attribDelete1.compute();
		assert.notOk(attribDelete1.states.error.active());
		assert.notOk(attribDelete1.states.error.message());
		coreGroup = container.coreContent()!;
		coreObject = coreGroup.allCoreObjects()[0];
		assert.notOk(coreObject.attribValue('test'));
		assert.deepEqual(coreObject.attribNames(), []);
	});

	qUnit.test('sop/attribDelete simple coreGroup', async (assert) => {
		const geo1 = window.geo1;
		const plane1 = geo1.createNode('plane');

		const attribCreate1 = geo1.createNode('attribCreate');
		attribCreate1.setInput(0, plane1);
		attribCreate1.setAttribClass(AttribClass.CORE_GROUP);
		attribCreate1.p.name.set('test');
		attribCreate1.p.value1.set(2);

		let container = await attribCreate1.compute();
		assert.notOk(attribCreate1.states.error.active());
		assert.notOk(attribCreate1.states.error.message());
		let coreGroup = container.coreContent()!;
		assert.equal(coreGroup.attribValue('test'), 2);
		assert.deepEqual(coreGroup.attribNames(), ['test']);

		const attribDelete1 = geo1.createNode('attribDelete');
		attribDelete1.p.name.set('test');
		attribDelete1.setAttribClass(AttribClass.CORE_GROUP);
		attribDelete1.setInput(0, attribCreate1);

		container = await attribDelete1.compute();
		assert.notOk(attribDelete1.states.error.active());
		assert.notOk(attribDelete1.states.error.message());
		coreGroup = container.coreContent()!;
		assert.notOk(coreGroup.attribValue('test'));
		assert.deepEqual(coreGroup.attribNames(), []);
	});
}
