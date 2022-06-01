import {AttribClass} from '../../../../src/core/geometry/Constant';

QUnit.test('expression object with float attr', async (assert) => {
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
});

QUnit.test('expression object with vector attr', async (assert) => {
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
