import type {QUnit} from '../../../helpers/QUnit';
import {BufferAttribute, Box3} from 'three';
export function testenginenodessopCSGMirror(qUnit: QUnit) {
	const tmpBox = new Box3();

	qUnit.test('sop/CSGMirror', async (assert) => {
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const box1 = geo1.createNode('CSGBox');
		const translate1 = geo1.createNode('transform');
		const mirror1 = geo1.createNode('CSGMirror');
		const CSGTriangulate1 = geo1.createNode('CSGTriangulate');

		translate1.setInput(0, box1);
		mirror1.setInput(0, translate1);
		mirror1.p.normal.set([1, 0, 0]);
		translate1.p.t.x.set(1);
		mirror1.flags.display.set(true);
		CSGTriangulate1.setInput(0, mirror1);

		async function computeMirror() {
			const container = await mirror1.compute();
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

		await computeMirror();
		assert.in_delta(tmpBox.min.x, -1.5, 0.002);

		assert.equal(
			((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
			108
		);
		assert.in_delta(tmpBox.min.x, -1.5, 0.002);
		assert.in_delta(tmpBox.max.x, -0.5, 0.002);
	});
}
