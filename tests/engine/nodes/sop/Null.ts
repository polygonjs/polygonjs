import type {QUnit} from '../../../helpers/QUnit';
export function testenginenodessopNull(qUnit: QUnit) {
	qUnit.test('null simple', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const null1 = geo1.createNode('null');

		null1.setInput(0, plane1);

		let container;

		container = await null1.compute();
		assert.equal(container.coreContent()!.pointsCount(), 4);
	});
}
