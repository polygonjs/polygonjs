import {BaseSopNodeType} from '../../../../src/engine/nodes/sop/_Base';

async function pointsCount(node: BaseSopNodeType) {
	const container = await node.compute();
	const coreGroup = container.coreContent()!;
	return coreGroup.pointsCount();
}

QUnit.test('sop/tetTriangulate simple', async (assert) => {
	const geo1 = window.geo1;

	const icosahedron1 = geo1.createNode('icosahedron');
	const tetrahedralize1 = geo1.createNode('tetrahedralize');
	const tetTriangulate1 = geo1.createNode('tetTriangulate');

	tetrahedralize1.setInput(0, icosahedron1);
	tetTriangulate1.setInput(0, tetrahedralize1);

	assert.equal(await pointsCount(tetTriangulate1), 732);

	icosahedron1.p.detail.set(3);
	assert.equal(await pointsCount(tetTriangulate1), 4992);

	tetrahedralize1.p.innerPointsResolution.set(8);
	assert.equal(await pointsCount(tetTriangulate1), 15216);

	tetTriangulate1.p.displayOuterMesh.set(1);
	assert.equal(await pointsCount(tetTriangulate1), 15498, 'outer mesh');
	tetTriangulate1.p.displayTetMesh.set(1);
	assert.equal(await pointsCount(tetTriangulate1), 15498, 'tet mesh');
	tetTriangulate1.p.displayLines.set(1);
	assert.equal(await pointsCount(tetTriangulate1), 20570, 'lines');
	tetTriangulate1.p.displaySharedFaces.set(1);
	assert.equal(await pointsCount(tetTriangulate1), 25322, 'shared faces');
	tetTriangulate1.p.displayPoints.set(1);
	assert.equal(await pointsCount(tetTriangulate1), 25604, 'points');
	tetTriangulate1.p.displayCenter.set(1);
	assert.equal(await pointsCount(tetTriangulate1), 26872, 'center');
	tetTriangulate1.p.displaySphere.set(1);
	assert.equal(await pointsCount(tetTriangulate1), 1407724, 'sphere');
});
