import type {QUnit} from '../../../helpers/QUnit';
import {Box3} from 'three';
export function testenginenodessopCircle(qUnit: QUnit) {
const tmpBox = new Box3();

qUnit.test('circle simple', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;

	const circle1 = geo1.createNode('circle');
	circle1.p.open.set(0);

	async function compute() {
		const container = await circle1.compute();
		const coreGroup = container.coreContent()!;
		const geometry = coreGroup.threejsObjectsWithGeo()[0].geometry;
		coreGroup.boundingBox(tmpBox);

		return {geometry, bbox: tmpBox, pointsCount: coreGroup.pointsCount()};
	}

	assert.ok((await compute()).geometry);
	assert.equal((await compute()).pointsCount, 14);
	assert.equal((await compute()).bbox.min.z, -1);

	scene.batchUpdates(() => {
		circle1.p.radius.set(2);
		circle1.p.segments.set(50);
	});

	assert.ok((await compute()).geometry);
	assert.equal((await compute()).pointsCount, 52);
	assert.in_delta((await compute()).bbox.min.z, -2.0, 0.01);
});

}