import type {QUnit} from '../../../helpers/QUnit';
import {BaseSopNodeType} from '../../../../src/engine/nodes/sop/_Base';
export function testenginenodessopTetDelete(qUnit: QUnit) {

async function tetsCount(node: BaseSopNodeType) {
	const container = await node.compute();
	const coreGroup = container.coreContent()!;
	const objects = coreGroup.tetObjects()!;
	const object = objects[0];
	const geometry = object.geometry;
	// const ids: number[] = [];
	// geometry.tetrahedrons.forEach((tet) => {
	// 	ids.push(tet.id);
	// });
	// console.log(ids.sort());
	return geometry.tetsCount();
}

qUnit.test('sop/tetDelete simple', async (assert) => {
	const geo1 = window.geo1;

	const icosahedron1 = geo1.createNode('icosahedron');
	const tetrahedralize1 = geo1.createNode('tetrahedralize');
	const tetDelete1 = geo1.createNode('tetDelete');

	tetrahedralize1.setInput(0, icosahedron1);
	tetrahedralize1.p.minQuality.set(0);
	tetDelete1.setInput(0, tetrahedralize1);

	assert.equal(await tetsCount(tetDelete1), 61);

	icosahedron1.p.detail.set(3);
	assert.equal(await tetsCount(tetDelete1), 416);

	// by quality
	tetDelete1.p.byQuality.set(true);
	tetDelete1.p.minQuality.set(0.5);
	assert.equal(await tetsCount(tetDelete1), 50);
	tetDelete1.p.minQuality.set(0.8);
	assert.equal(await tetsCount(tetDelete1), 0);
	tetDelete1.p.minQuality.set(0.2);
	assert.equal(await tetsCount(tetDelete1), 410);
	tetDelete1.p.invert.set(true);
	assert.equal(await tetsCount(tetDelete1), 6);
	tetDelete1.p.byQuality.set(false);
	tetDelete1.p.invert.set(false);

	// by id
	tetDelete1.p.byIds.set(true);
	tetDelete1.p.ids.set('2753  2754  2755  2756 2757');
	assert.equal(await tetsCount(tetDelete1), 411);
	tetDelete1.p.ids.set('2753-2758');
	assert.equal(await tetsCount(tetDelete1), 410);
	tetDelete1.p.invert.set(true);
	assert.equal(await tetsCount(tetDelete1), 6);
	tetDelete1.p.byIds.set(false);
	tetDelete1.p.invert.set(false);

	// by index
	tetDelete1.p.byIndex.set(true);
	tetDelete1.p.index.set(0);
	assert.equal(await tetsCount(tetDelete1), 415);
	tetDelete1.p.index.set(1);
	assert.equal(await tetsCount(tetDelete1), 415);
	tetDelete1.p.invert.set(true);
	assert.equal(await tetsCount(tetDelete1), 1);
	tetDelete1.p.byIndex.set(false);
	tetDelete1.p.invert.set(false);

	// by index range
	tetDelete1.p.byIndexRange.set(true);
	tetDelete1.p.indexRangeStart.set(10);
	assert.equal(await tetsCount(tetDelete1), 10);
	tetDelete1.p.indexRangeStart.set(21);
	assert.equal(await tetsCount(tetDelete1), 21);
	tetDelete1.p.indexRangeStart.set(99);
	assert.equal(await tetsCount(tetDelete1), 99);
	tetDelete1.p.invert.set(true);
	assert.equal(await tetsCount(tetDelete1), 317);
	tetDelete1.p.byIndexRange.set(false);
	tetDelete1.p.invert.set(false);

	// by bounding object
	const sphere1 = geo1.createNode('sphere');
	sphere1.p.center.set([0, 0, 0]);
	sphere1.p.radius.set(0.5);
	tetDelete1.setInput(1, sphere1);
	tetDelete1.p.byBoundingObject.set(true);
	assert.equal(await tetsCount(tetDelete1), 395);
	sphere1.p.radius.set(2);
	assert.equal(await tetsCount(tetDelete1), 0);
	sphere1.p.radius.set(0.4);
	assert.equal(await tetsCount(tetDelete1), 407);
	tetDelete1.p.invert.set(true);
	assert.equal(await tetsCount(tetDelete1), 9);
	tetDelete1.p.byBoundingObject.set(false);
	tetDelete1.p.invert.set(false);
});

}