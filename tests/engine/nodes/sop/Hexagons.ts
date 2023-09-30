import type {QUnit} from '../../../helpers/QUnit';
export function testenginenodessopHexagons(qUnit: QUnit) {
	qUnit.test('hexagons simple', async (assert) => {
		const geo1 = window.geo1;

		const hexagons1 = geo1.createNode('hexagons');

		let container;

		container = await hexagons1.compute();
		assert.equal(container.coreContent()!.pointsCount(), 110);
	});
}
