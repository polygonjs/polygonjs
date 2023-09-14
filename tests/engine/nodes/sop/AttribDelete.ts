import type {QUnit} from '../../../helpers/QUnit';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {
	corePointClassFactory,
	coreVertexClassFactory,
	corePrimitiveClassFactory,
	coreObjectClassFactory,
} from '../../../../src/core/geometry/CoreObjectFactory';
import {AttribDeleteSopNode} from '../../../../src/engine/nodes/sop/AttribDelete';
import {AttribCreateSopNode} from '../../../../src/engine/nodes/sop/AttribCreate';
export function testenginenodessopAttribDelete(qUnit: QUnit) {
	qUnit.test('sop/attribDelete simple point', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const quadPlane1 = geo1.createNode('quadPlane');
		const attribCreate1 = geo1.createNode('attribCreate');
		const attribDelete1 = geo1.createNode('attribDelete');

		async function hasAttrib(node: AttribDeleteSopNode | AttribCreateSopNode) {
			const container = await node.compute();
			const object = container.coreContent()!.allObjects()[0];
			const entityClass = corePointClassFactory(object);
			return entityClass.hasAttribute(object, 'test');
		}

		const inputNodes = [plane1, quadPlane1];
		for (const inputNode of inputNodes) {
			attribCreate1.setInput(0, inputNode);
			attribDelete1.setInput(0, attribCreate1);

			attribCreate1.p.name.set('test');
			attribCreate1.setAttribClass(AttribClass.POINT);
			attribCreate1.p.value1.set('@ptnum');
			attribDelete1.p.name.set('test');
			attribDelete1.setAttribClass(AttribClass.POINT);

			assert.ok(await hasAttrib(attribCreate1), 'has attrib');
			assert.notOk(attribCreate1.states.error.active());
			assert.notOk(attribCreate1.states.error.message());

			assert.notOk(await hasAttrib(attribDelete1), 'no attrib');
			assert.notOk(attribDelete1.states.error.active());
			assert.notOk(attribDelete1.states.error.message());
		}
	});

	qUnit.test('sop/attribDelete simple vertex', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const quadPlane1 = geo1.createNode('quadPlane');
		const attribCreate1 = geo1.createNode('attribCreate');
		const attribDelete1 = geo1.createNode('attribDelete');
		attribDelete1.setInput(0, attribCreate1);

		async function hasAttrib(node: AttribDeleteSopNode | AttribCreateSopNode) {
			const container = await node.compute();
			const object = container.coreContent()!.allObjects()[0];
			const entityClass = coreVertexClassFactory(object);
			return entityClass.hasAttribute(object, 'test');
		}

		const inputNodes = [plane1, quadPlane1];
		for (const inputNode of inputNodes) {
			attribCreate1.setInput(0, inputNode);
			attribCreate1.p.name.set('test');
			attribCreate1.setAttribClass(AttribClass.VERTEX);
			attribCreate1.p.value1.set('@vtxnum');
			attribDelete1.p.name.set('test');
			attribDelete1.setAttribClass(AttribClass.VERTEX);

			assert.ok(await hasAttrib(attribCreate1), 'has attrib');
			assert.notOk(attribCreate1.states.error.active());
			assert.notOk(attribCreate1.states.error.message());

			assert.notOk(await hasAttrib(attribDelete1), 'no attrib');
			assert.notOk(attribDelete1.states.error.active());
			assert.notOk(attribDelete1.states.error.message());
		}
	});

	qUnit.test('sop/attribDelete simple prim', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const quadPlane1 = geo1.createNode('quadPlane');
		const attribCreate1 = geo1.createNode('attribCreate');
		const attribDelete1 = geo1.createNode('attribDelete');
		attribDelete1.setInput(0, attribCreate1);

		async function hasAttrib(node: AttribDeleteSopNode | AttribCreateSopNode) {
			const container = await node.compute();
			const object = container.coreContent()!.allObjects()[0];
			const entityClass = corePrimitiveClassFactory(object);
			return entityClass.hasAttribute(object, 'test');
		}

		const inputNodes = [plane1, quadPlane1];
		for (const inputNode of inputNodes) {
			attribCreate1.setInput(0, inputNode);
			attribCreate1.p.name.set('test');
			attribCreate1.setAttribClass(AttribClass.PRIMITIVE);
			attribCreate1.p.value1.set('@primnum');
			attribDelete1.p.name.set('test');
			attribDelete1.setAttribClass(AttribClass.PRIMITIVE);

			assert.ok(await hasAttrib(attribCreate1), 'has attrib');
			assert.notOk(attribCreate1.states.error.active());
			assert.notOk(attribCreate1.states.error.message());

			assert.notOk(await hasAttrib(attribDelete1), 'no attrib');
			assert.notOk(attribDelete1.states.error.active());
			assert.notOk(attribDelete1.states.error.message());
		}
	});

	qUnit.test('sop/attribDelete simple object', async (assert) => {
		const geo1 = window.geo1;
		const plane1 = geo1.createNode('plane');
		const quadPlane1 = geo1.createNode('quadPlane');
		const attribCreate1 = geo1.createNode('attribCreate');
		const attribDelete1 = geo1.createNode('attribDelete');

		async function hasAttrib(node: AttribDeleteSopNode | AttribCreateSopNode) {
			const container = await node.compute();
			const object = container.coreContent()!.allObjects()[0];
			const entityClass = coreObjectClassFactory(object);
			return entityClass.hasAttribute(object, 'test');
		}

		const inputNodes = [plane1, quadPlane1];
		for (const inputNode of inputNodes) {
			attribCreate1.setInput(0, inputNode);
			attribCreate1.setAttribClass(AttribClass.OBJECT);
			attribCreate1.p.name.set('test');
			attribCreate1.p.value1.set(2);
			attribDelete1.p.name.set('test');
			attribDelete1.setAttribClass(AttribClass.OBJECT);
			attribDelete1.setInput(0, attribCreate1);

			assert.ok(await hasAttrib(attribCreate1));
			assert.notOk(attribCreate1.states.error.active());
			assert.notOk(attribCreate1.states.error.message());
			// assert.equal(coreObject.attribValue('test'), 2);
			// assert.deepEqual(coreObject.attribNames(), ['test']);

			assert.notOk(await hasAttrib(attribDelete1));
			assert.notOk(attribDelete1.states.error.active());
			assert.notOk(attribDelete1.states.error.message());
			// assert.notOk(coreObject.attribValue('test'));
			// assert.deepEqual(coreObject.attribNames(), []);
		}
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
