import type {QUnit} from '../../../helpers/QUnit';
import {BufferAttribute, Box3} from 'three';
export function testenginenodessopCSGHull(qUnit: QUnit) {
	const tmpBox = new Box3();

	qUnit.test('sop/CSGHull', async (assert) => {
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const box1 = geo1.createNode('CSGBox');
		const sphere1 = geo1.createNode('CSGSphere');
		const merge1 = geo1.createNode('merge');
		const hull1 = geo1.createNode('CSGHull');
		const CSGTriangulate1 = geo1.createNode('CSGTriangulate');

		merge1.setInput(0, box1);
		merge1.setInput(1, sphere1);
		hull1.setInput(0, merge1);
		box1.p.sizes.x.set(5);
		hull1.flags.display.set(true);
		CSGTriangulate1.setInput(0, hull1);

		async function computeHull() {
			const container = await hull1.compute();
			const coreGroup = container.coreContent()!;
			const allObjectsCount = coreGroup.allObjects().length;
			const threejsObjectsCount = coreGroup.threejsObjects().length;

			container.coreContent()!.boundingBox(tmpBox);

			return {allObjectsCount, threejsObjectsCount};
		}
		async function computeTriangulate() {
			const container = await CSGTriangulate1.compute();
			const coreGroup = container.coreContent()!;
			const allObjectsCount = coreGroup.allObjects().length;
			const threejsObjectsCount = coreGroup.threejsObjects().length;

			const geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry;

			container.coreContent()!.boundingBox(tmpBox);

			return {allObjectsCount, threejsObjectsCount, geometry};
		}
		await computeHull();
		assert.in_delta(tmpBox.min.x, -2.5, 0.002);

		assert.equal(
			((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
			1116
		);
		assert.in_delta(tmpBox.min.x, -2.5, 0.002);
		assert.in_delta(tmpBox.max.x, 2.5, 0.002);
	});
}
