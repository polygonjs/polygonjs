import type {QUnit} from '../../../helpers/QUnit';
export function testengineexpressionsmethodsmin(qUnit: QUnit) {
qUnit.test('expression min works', async (assert) => {
	const geo1 = window.geo1;

	const tx = geo1.p.t.x;

	tx.set('min(12,17)');
	await tx.compute();
	assert.equal(tx.value, 12);

	tx.set('min(5,-1)');
	await tx.compute();
	assert.equal(tx.value, -1);
});

}