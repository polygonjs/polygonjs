import type {QUnit} from '../../../helpers/QUnit';
export function testengineexpressionsmethodsif(qUnit: QUnit) {
qUnit.test('if work on a simple case', async (assert) => {
	const geo1 = window.geo1;

	geo1.p.t.x.set('if(0, 2, 1)');
	await geo1.p.t.x.compute();
	assert.equal(geo1.p.t.x.value, 1);

	geo1.p.t.x.set('if(1, 2, 1)');
	await geo1.p.t.x.compute();
	assert.equal(geo1.p.t.x.value, 2);
});

}