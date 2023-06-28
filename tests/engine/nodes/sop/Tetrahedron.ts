import {BaseSopNodeType} from '../../../../src/engine/nodes/sop/_Base';

async function pointsCount(node: BaseSopNodeType) {
	const container = await node.compute();
	const coreGroup = container.coreContent()!;
	return coreGroup.pointsCount();
}

QUnit.test('sop/tetrahedron simple', async (assert) => {
	const geo1 = window.geo1;

	const tetrahedron1 = geo1.createNode('tetrahedron');

	assert.equal(await pointsCount(tetrahedron1), 12);
	tetrahedron1.p.detail.set(5);
	assert.equal(await pointsCount(tetrahedron1), 432);
});
