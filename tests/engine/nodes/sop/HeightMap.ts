import type {QUnit} from '../../../helpers/QUnit';
import {Box3} from 'three';
export function testenginenodessopHeightMap(qUnit: QUnit) {
	const tmpBox = new Box3();
	qUnit.test('height map simple', async (assert) => {
		const geo1 = window.geo1;
		const COP = window.COP;

		const file1 = COP.createNode('image');

		const plane1 = geo1.createNode('plane');
		const height_map1 = geo1.createNode('heightMap');

		height_map1.setInput(0, plane1);
		height_map1.p.texture.set(file1.path());
		height_map1.p.mult.set(100);

		let container = await height_map1.compute();
		container.coreContent()!.boundingBox(tmpBox);
		assert.equal(tmpBox.min.y, 6200);
		assert.equal(tmpBox.max.y, 10800);
	});
}
