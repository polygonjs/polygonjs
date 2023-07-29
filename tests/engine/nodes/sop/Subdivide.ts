import type {QUnit} from '../../../helpers/QUnit';
export function testenginenodessopSubdivide(qUnit: QUnit) {
qUnit.test('sop/subdivide simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const subdivide1 = geo1.createNode('subdivide');

	subdivide1.setInput(0, box1);

	async function pointsCount() {
		const container = await subdivide1.compute();
		const coreGroup = container.coreContent()!;
		return coreGroup.pointsCount();
	}

	assert.equal(await pointsCount(), 78);

	subdivide1.p.subdivisions.set(0);
	assert.equal(await pointsCount(), 30);

	subdivide1.p.subdivisions.set(2);
	assert.equal(await pointsCount(), 246);

	subdivide1.p.subdivisions.set(3);
	assert.equal(await pointsCount(), 870);

	subdivide1.flags.bypass.set(true);
	assert.equal(await pointsCount(), 24);

	// without mergeVertices
	subdivide1.flags.bypass.set(false);
	subdivide1.p.mergeVertices.set(false);
	assert.equal(await pointsCount(), 4608);
});

}