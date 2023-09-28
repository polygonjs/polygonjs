import type {QUnit} from '../../../helpers/QUnit';
import {Box3, Vector3} from 'three';
export function testenginenodessopLattice(qUnit: QUnit) {
	const tmpBox = new Box3();
	const bboxSize = new Vector3();

	qUnit.test('sop/lattice simple', async (assert) => {
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const box1 = geo1.createNode('box');
		const lattice1 = geo1.createNode('lattice');

		lattice1.setInput(0, box1);
		box1.p.center.set([0.5, 0.5, 0.5]);

		async function compute() {
			const container = await lattice1.compute();
			const coreGroup = container.coreContent();
			const object = coreGroup?.threejsObjectsWithGeo()[0]!;
			const geometry = object.geometry;
			const position = geometry?.getAttribute('position')!;
			container.boundingBox(tmpBox);
			tmpBox.getSize(bboxSize);
			return {position, bboxSizeY: bboxSize.y, objectPositionY: object.position.y};
		}

		lattice1.p.moveObjectPosition.set(0);

		assert.equal((await compute()).position.array[13], 1);
		assert.equal((await compute()).bboxSizeY, 1);
		assert.equal((await compute()).objectPositionY, 0);

		lattice1.p.p4.y.set(2);
		assert.equal((await compute()).position.array[13], 2);
		assert.equal((await compute()).bboxSizeY, 2);

		lattice1.p.moveObjectPosition.set(1);
		assert.equal((await compute()).position.array[13], 1);
		assert.equal((await compute()).bboxSizeY, 2);
		assert.equal((await compute()).objectPositionY, 1);
	});
}
