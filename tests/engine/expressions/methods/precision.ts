import type {QUnit} from '../../../helpers/QUnit';
export function testengineexpressionsmethodsprecision(qUnit: QUnit) {
qUnit.test('expression precision works on a float', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');

	box1.p.center.y.set('precision(-5.12657, 2)');

	await box1.p.center.y.compute();
	assert.in_delta(box1.p.center.y.value, -5.12, 0.001);

	box1.p.center.y.set('precision(5, 2)');
	await box1.p.center.y.compute();
	assert.equal(box1.p.center.y.value, 5);

	box1.p.center.y.set('precision(-5*3.1+0.1, 2)');
	await box1.p.center.y.compute();
	assert.equal(box1.p.center.y.value, -15.4);
});

qUnit.test('expression precision works on a string', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');
	const attribtransfer1 = geo1.createNode('attribTransfer');
	attribtransfer1.setInput(0, box1);
	attribtransfer1.setInput(0, box2);

	const param = attribtransfer1.p.srcGroup;
	param.set('`precision(-5.12657, 2)`');

	await param.compute();
	assert.equal(param.value, '-5.12');

	param.set('`precision(5, 2)`');
	await param.compute();
	assert.equal(param.value, '5.00');

	param.set('`precision(-5*3.1+0.1, 2)`');
	await param.compute();
	assert.equal(param.value, '-15.40');
});

}