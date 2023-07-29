import type {QUnit} from '../../../helpers/QUnit';
export function testenginenodessopTorus(qUnit: QUnit) {
qUnit.test('torus simple', async (assert) => {
	const geo1 = window.geo1;

	const torus1 = geo1.createNode('torus');

	let container = await torus1.compute();
	const core_group = container.coreContent()!;
	const {geometry} = core_group.threejsObjectsWithGeo()[0];

	assert.ok(geometry);
	assert.equal(container.pointsCount(), 1071);
});

}