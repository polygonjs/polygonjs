import type {QUnit} from '../../../helpers/QUnit';
export function testengineexpressionsmethodsceil(qUnit: QUnit) {
qUnit.test('expression ceil simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');

	box1.p.size.set('ceil(3.2)');

	await box1.p.size.compute();
	assert.equal(box1.p.size.value, 4);
});

}