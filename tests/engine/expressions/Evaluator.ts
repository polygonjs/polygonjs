import type {QUnit} from '../../helpers/QUnit';
export function testengineexpressionsEvaluator(qUnit: QUnit) {
qUnit.test('simple expression', async (assert) => {
	const geo1 = window.geo1;

	const tx = geo1.p.t.x;

	tx.set('$PI');
	await tx.compute();
	assert.equal(tx.value, Math.PI);

	tx.set('1+1');
	await tx.compute();
	assert.equal(tx.value, 2);

	tx.set('-1+1');
	await tx.compute();
	assert.equal(tx.value, 0);
});

qUnit.test('simple expression 2', async (assert) => {
	const geo1 = window.geo1;

	const tx = geo1.p.t.x;

	tx.set('$PI * 3');
	await tx.compute();
	assert.equal(tx.value, Math.PI * 3);

	tx.set('$PI * -3');
	await tx.compute();
	assert.equal(tx.value, Math.PI * -3);

	tx.set('-3*$PI');
	await tx.compute();
	assert.equal(tx.value, Math.PI * -3);
});

qUnit.test('simple expression with errors', async (assert) => {
	const geo1 = window.geo1;

	const tx = geo1.p.t.x;

	tx.set('3+');
	await tx.compute();
	assert.equal(tx.value, 0);
	assert.equal(tx.states.error.message(), 'expression error: "3+" (cannot parse expression)');

	tx.set('3+bla');
	await tx.compute();
	assert.equal(tx.value, 0);
	assert.equal(tx.states.error.message(), 'expression error: "3+bla" (bla is not defined)');
});

}