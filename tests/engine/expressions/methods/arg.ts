import type {QUnit} from '../../../helpers/QUnit';
export function testengineexpressionsmethodsarg(qUnit: QUnit) {
qUnit.test('expression arg simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	assert.equal(box1.name(), 'box1');
	const box2 = geo1.createNode('box');

	box2.p.size.set(`arg("1 17 15 3 7", 4)`);
	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 7);

	box2.p.size.set(`arg("1 17 15 3 7", 3)`);
	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 3);
});

}