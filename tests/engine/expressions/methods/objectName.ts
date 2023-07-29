import type {QUnit} from '../../../helpers/QUnit';
export function testengineexpressionsmethodsobjectName(qUnit: QUnit) {
qUnit.test('expression/objectName with node path', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');
	const box3 = geo1.createNode('box');
	const merge1 = geo1.createNode('merge');
	const null1 = geo1.createNode('null');

	const text1 = geo1.createNode('text');

	null1.setInput(0, merge1);
	merge1.setInput(0, box1);
	merge1.setInput(1, box2);

	const param = text1.p.text;
	param.set(`\`objectName('${null1.path()}', objectsCount('${null1.path()}')-1 )\``);

	await param.compute();
	assert.equal(param.value, 'box2');

	merge1.setInput(2, box3);
	await param.compute();
	assert.equal(param.value, 'box3');
});

qUnit.test('expression/objectName with index', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');
	const box3 = geo1.createNode('box');
	const merge1 = geo1.createNode('merge');

	const transform1 = geo1.createNode('transform');

	merge1.setInput(0, box1);
	merge1.setInput(1, box2);
	transform1.setInput(0, merge1);

	const param = transform1.p.group;
	param.set(`\`objectName(0, objectsCount(0)-1)\``);

	await param.compute();
	assert.equal(param.value, 'box2');

	merge1.setInput(2, box3);
	await param.compute();
	assert.equal(param.value, 'box3');
});

}