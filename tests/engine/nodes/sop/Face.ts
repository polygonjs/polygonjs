import type {QUnit} from '../../../helpers/QUnit';
import {Vector3, Box3} from 'three';
export function testenginenodessopFace(qUnit: QUnit) {
const tmpBox = new Box3();
const tmpSize = new Vector3();

qUnit.test('face simple', async (assert) => {
	const geo1 = window.geo1;

	const sphere1 = geo1.createNode('sphere');
	sphere1.p.resolution.set([8, 6]);
	const face1 = geo1.createNode('face');
	face1.setInput(0, sphere1);
	face1.p.makeFacesUnique.set(0);

	async function compute() {
		const container = await face1.compute();
		const coreGroup = container.coreContent()!;
		coreGroup.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);

		return {bbox: tmpBox, size: tmpSize, pointsCount: coreGroup.pointsCount()};
	}

	// let container = await face1.compute();
	assert.equal((await compute()).pointsCount, 63);

	face1.p.makeFacesUnique.set(1);
	// container = await face1.compute();
	assert.equal((await compute()).pointsCount, 240);
	assert.deepEqual((await compute()).size.toArray(), [2, 2, 2]);

	face1.p.transform.set(1);
	face1.p.scale.set(2);
	// container = await face1.compute();
	assert.equal((await compute()).pointsCount, 240);
	assert.deepEqual((await compute()).size.toArray(), [2.4536805152893066, 2.2200846672058105, 2.4536805152893066]);
});

}