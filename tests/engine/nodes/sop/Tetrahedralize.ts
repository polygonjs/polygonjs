import type {QUnit} from '../../../helpers/QUnit';
import {BaseSopNodeType} from '../../../../src/engine/nodes/sop/_Base';
export function testenginenodessopTetrahedralize(qUnit: QUnit) {

async function tetsCount(node: BaseSopNodeType) {
	const container = await node.compute();
	const coreGroup = container.coreContent()!;
	const objects = coreGroup.tetObjects()!;
	const object = objects[0];
	const geometry = object.geometry;
	return geometry.tetsCount();
}

qUnit.test('sop/tetrahedralize simple', async (assert) => {
	const geo1 = window.geo1;

	const icosahedron1 = geo1.createNode('icosahedron');
	const tetrahedralize1 = geo1.createNode('tetrahedralize');

	tetrahedralize1.setInput(0, icosahedron1);
	tetrahedralize1.p.minQuality.set(0);

	assert.equal(await tetsCount(tetrahedralize1), 61);

	icosahedron1.p.detail.set(3);
	assert.equal(await tetsCount(tetrahedralize1), 416);

	tetrahedralize1.p.innerPointsResolution.set(8);
	assert.equal(await tetsCount(tetrahedralize1), 1268);

	tetrahedralize1.p.minQuality.set(0.25);
	assert.equal(await tetsCount(tetrahedralize1), 1154);
});

}