import type {QUnit} from '../../../helpers/QUnit';
import {BaseSopNodeType} from '../../../../src/engine/nodes/sop/_Base';
export function testenginenodessopTetrahedron(qUnit: QUnit) {

async function pointsCount(node: BaseSopNodeType) {
	const container = await node.compute();
	const coreGroup = container.coreContent()!;
	return coreGroup.pointsCount();
}

qUnit.test('sop/tetrahedron simple', async (assert) => {
	const geo1 = window.geo1;

	const tetrahedron1 = geo1.createNode('tetrahedron');

	assert.equal(await pointsCount(tetrahedron1), 12);
	tetrahedron1.p.detail.set(5);
	assert.equal(await pointsCount(tetrahedron1), 432);
});

}