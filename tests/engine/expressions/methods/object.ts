import type {QUnit} from '../../../helpers/QUnit';
import {BaseCoreObject} from './../../../../src/core/geometry/entities/object/BaseCoreObject';
import {AttribClass, AttribType} from '../../../../src/core/geometry/Constant';
import {CoreObjectType} from '../../../../src/core/geometry/ObjectContent';
export function testengineexpressionsmethodsobject(qUnit: QUnit) {
	qUnit.test('expression object with float attr', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const attribCreate = geo1.createNode('attribCreate');
		attribCreate.setInput(0, plane1);
		attribCreate.setAttribClass(AttribClass.OBJECT);
		attribCreate.p.name.set('test');
		attribCreate.p.value1.set(17.4);

		const box = geo1.createNode('box');
		const param = box.p.size;
		param.set(`object('${attribCreate.path()}', 'test', 0)`);
		await param.compute();
		assert.equal(param.value, 17.4);

		param.set(`object('${attribCreate.path()}', 'test')`);
		await param.compute();
		assert.equal(param.value, 17.4);

		param.set(`object('${attribCreate.path()}', 'test', 1)`);
		await param.compute();
		assert.equal(param.value, 0);
	});

	qUnit.test('expression object with string attr', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const attribCreate1 = geo1.createNode('attribCreate');
		const attribCreate2 = geo1.createNode('attribCreate');
		attribCreate1.setInput(0, plane1);
		attribCreate1.setAttribClass(AttribClass.OBJECT);
		attribCreate1.setAttribType(AttribType.STRING);
		attribCreate1.p.name.set('test');
		attribCreate1.p.string.set('haha');

		attribCreate2.setInput(0, attribCreate1);
		attribCreate2.setAttribClass(AttribClass.OBJECT);
		attribCreate2.setAttribType(AttribType.STRING);
		attribCreate2.p.name.set('test2');

		async function getValues() {
			const container = await attribCreate2.compute();
			const values = container
				.coreContent()
				?.allCoreObjects()
				.map((o: BaseCoreObject<CoreObjectType>) => o.attribValue('test2') as string);
			return values;
		}

		const param = attribCreate2.p.string;
		param.set(`\`object(0, 'test', 0)\``);
		assert.deepEqual(await getValues(), ['haha']);

		param.set(`\`object(0, 'test')\``);
		assert.deepEqual(await getValues(), ['haha']);

		param.set(`\`object(0, 'test', 1)\``);
		assert.deepEqual(await getValues(), ['0']);
	});

	qUnit.test('expression object with vector attr', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const attribCreate = geo1.createNode('attribCreate');
		attribCreate.setInput(0, plane1);
		attribCreate.setAttribClass(AttribClass.OBJECT);
		attribCreate.p.size.set(3);
		attribCreate.p.name.set('test');
		attribCreate.p.value3.set([17.4, 5.12, 21.3]);

		const box = geo1.createNode('box');
		const param = box.p.size;
		param.set(`object('${attribCreate.path()}', 'test', 0).y`);
		await param.compute();
		assert.equal(param.value, 5.12);
	});
}
