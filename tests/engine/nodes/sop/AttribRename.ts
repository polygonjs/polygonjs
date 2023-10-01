import type {QUnit} from '../../../helpers/QUnit';
import {ENTITY_CLASS_FACTORY} from '../../../../src/core/geometry/CoreObjectFactory';
import {ATTRIBUTE_CLASSES} from '../../../../src/core/geometry/Constant';
import {AttribRenameSopNode} from '../../../../src/engine/nodes/sop/AttribRename';
import {AttribCreateSopNode} from '../../../../src/engine/nodes/sop/AttribCreate';
export function testenginenodessopAttribRename(qUnit: QUnit) {
	qUnit.test('sop/attribRename simple', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const quadPlane1 = geo1.createNode('quadPlane');
		const inputNodes = [plane1, quadPlane1];
		const attribCreate1 = geo1.createNode('attribCreate');
		const attribRename1 = geo1.createNode('attribRename');
		attribRename1.setInput(0, attribCreate1);

		attribCreate1.p.name.set('test');
		attribCreate1.p.value1.set('@ptnum');
		attribRename1.p.oldName.set('test');
		attribRename1.p.newName.set('test2');

		for (const attribClass of ATTRIBUTE_CLASSES) {
			async function hasAttrib(node: AttribRenameSopNode | AttribCreateSopNode, attribName: string) {
				const container = await node.compute();
				const coreGroup = container.coreContent()!;
				const object = coreGroup.allObjects()[0];
				const factory = ENTITY_CLASS_FACTORY[attribClass];
				if (factory) {
					const entityClass = factory(object);
					return entityClass.hasAttribute(object, attribName);
				} else {
					return coreGroup.hasAttribute(attribName);
				}
			}

			attribCreate1.setAttribClass(attribClass);
			attribRename1.setAttribClass(attribClass);
			for (const inputNode of inputNodes) {
				attribCreate1.setInput(0, inputNode);

				assert.ok(await hasAttrib(attribCreate1, 'test'), `has attrib test (${attribClass})`);
				assert.notOk(await hasAttrib(attribCreate1, 'test2'), `not attrib test2 (${attribClass})`);
				assert.notOk(attribCreate1.states.error.active());
				assert.notOk(attribCreate1.states.error.message());

				assert.notOk(await hasAttrib(attribRename1, 'test'), `no attrib (${attribClass})`);
				assert.ok(await hasAttrib(attribRename1, 'test2'), `no attrib (${attribClass})`);
				assert.notOk(attribRename1.states.error.active());
				assert.notOk(attribRename1.states.error.message());
			}
		}
	});

	qUnit.test('sop/attribRename multiple', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const quadPlane1 = geo1.createNode('quadPlane');
		const inputNodes = [plane1, quadPlane1];
		const attribCreate1 = geo1.createNode('attribCreate');
		const attribCreate2 = geo1.createNode('attribCreate');
		const attribCreate3 = geo1.createNode('attribCreate');
		const attribRename1 = geo1.createNode('attribRename');
		// attribCreate1.setInput(0, plane1);
		attribCreate2.setInput(0, attribCreate1);
		attribCreate3.setInput(0, attribCreate2);
		attribRename1.setInput(0, attribCreate3);

		attribCreate1.p.name.set('_a');
		attribCreate2.p.name.set('_b');
		attribCreate3.p.name.set('_c');
		attribRename1.p.oldName.set('_a _b _c');
		attribRename1.p.newName.set('a b c');

		for (const attribClass of ATTRIBUTE_CLASSES) {
			async function hasAttrib(node: AttribRenameSopNode | AttribCreateSopNode, attribName: string) {
				const container = await node.compute();
				const coreGroup = container.coreContent()!;
				const object = coreGroup.allObjects()[0];
				const factory = ENTITY_CLASS_FACTORY[attribClass];
				if (factory) {
					const entityClass = factory(object);
					return entityClass.hasAttribute(object, attribName);
				} else {
					return coreGroup.hasAttribute(attribName);
				}
			}

			attribCreate1.setAttribClass(attribClass);
			attribCreate2.setAttribClass(attribClass);
			attribCreate3.setAttribClass(attribClass);
			attribRename1.setAttribClass(attribClass);
			for (const inputNode of inputNodes) {
				attribCreate1.setInput(0, inputNode);

				assert.ok(await hasAttrib(attribCreate3, '_a'), `has attrib _a (${attribClass}, ${inputNode.type()})`);
				assert.ok(await hasAttrib(attribCreate3, '_b'), `has attrib _b (${attribClass})`);
				assert.ok(await hasAttrib(attribCreate3, '_c'), `has attrib _c (${attribClass})`);
				assert.notOk(await hasAttrib(attribCreate3, 'a'), `not attrib a (${attribClass})`);
				assert.notOk(await hasAttrib(attribCreate3, 'b'), `not attrib b (${attribClass})`);
				assert.notOk(await hasAttrib(attribCreate3, 'c'), `not attrib c (${attribClass})`);
				assert.notOk(attribCreate3.states.error.active());
				assert.notOk(attribCreate3.states.error.message());

				assert.notOk(await hasAttrib(attribRename1, '_a'), `no attrib _a (${attribClass})`);
				assert.notOk(await hasAttrib(attribRename1, '_b'), `no attrib _b (${attribClass})`);
				assert.notOk(await hasAttrib(attribRename1, '_c'), `no attrib _c (${attribClass})`);
				assert.ok(await hasAttrib(attribRename1, 'a'), `has attrib a (${attribClass})`);
				assert.ok(await hasAttrib(attribRename1, 'b'), `has attrib b (${attribClass})`);
				assert.ok(await hasAttrib(attribRename1, 'c'), `has attrib c (${attribClass})`);
				assert.notOk(attribRename1.states.error.active());
				assert.notOk(attribRename1.states.error.message());
			}
		}
	});
}
