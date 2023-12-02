import type {QUnit} from '../../../helpers/QUnit';
import {BufferAttribute} from 'three';
export function testenginenodessopColor(qUnit: QUnit) {
	qUnit.test('sop/color simple', async (assert) => {
		const geo1 = window.geo1;

		const box1 = geo1.createNode('box');
		const color1 = geo1.createNode('color');
		color1.setInput(0, box1);
		color1.p.color.set([0.4, 0.5, 0.6]);

		let container = await color1.compute();
		let core_group = container.coreContent()!;
		let geometry = core_group.threejsObjectsWithGeo()[0].geometry;

		// let color = await color1.p.color.compute();
		let {array} = geometry.getAttribute('color') as BufferAttribute;
		const position = (geometry.getAttribute('position') as BufferAttribute).array;
		assert.equal(array.length, position.length);
		assert.in_delta(array[0], 0.4, 0.001);
		assert.in_delta(array[1], 0.5, 0.001);
		assert.in_delta(array[2], 0.6, 0.001);

		color1.p.color.set([1.5, 0.5, 0.75]);
		container = await color1.compute();
		core_group = container.coreContent()!;
		geometry = core_group.threejsObjectsWithGeo()[0].geometry;
		({array} = geometry.getAttribute('color') as BufferAttribute);
		assert.equal(array[0], 1.5);
		assert.equal(array[1], 0.5);
		assert.equal(array[2], 0.75);
		assert.equal(array[3], 1.5);
		assert.equal(array[4], 0.5);
		assert.equal(array[5], 0.75);
	});

	qUnit.test('sop/color with expression', async (assert) => {
		const geo1 = window.geo1;

		const box1 = geo1.createNode('box');
		const color1 = geo1.createNode('color');
		color1.setInput(0, box1);

		color1.p.color.r.set('@ptnum+1');

		let container = await color1.compute();
		let core_group = container.coreContent()!;
		let geometry = core_group.threejsObjectsWithGeo()[0].geometry;

		const array = (geometry.getAttribute('color') as BufferAttribute).array;
		assert.equal(
			array.join(','),
			[
				1, 1, 1, 2, 1, 1, 3, 1, 1, 4, 1, 1, 5, 1, 1, 6, 1, 1, 7, 1, 1, 8, 1, 1, 9, 1, 1, 10, 1, 1, 11, 1, 1, 12,
				1, 1, 13, 1, 1, 14, 1, 1, 15, 1, 1, 16, 1, 1, 17, 1, 1, 18, 1, 1, 19, 1, 1, 20, 1, 1, 21, 1, 1, 22, 1,
				1, 23, 1, 1, 24, 1, 1,
			].join(',')
		);
	});

	qUnit.test('sop/color with position', async (assert) => {
		const geo1 = window.geo1;

		const box1 = geo1.createNode('box');
		box1.p.center.set([0.5, 0.5, 0.5]);
		const color1 = geo1.createNode('color');
		color1.setInput(0, box1);

		color1.p.color.r.set('@P.x');
		color1.p.color.g.set('@P.y');
		color1.p.color.b.set('@P.z');

		let container, core_group, geometry, array;
		container = await color1.compute();
		core_group = container.coreContent()!;
		geometry = core_group.threejsObjectsWithGeo()[0].geometry;
		array = (geometry.getAttribute('color') as BufferAttribute).array;
		assert.equal(
			array.join(','),
			[
				1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1,
				1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0,
				0, 0,
			].join(',')
		);

		color1.p.color.r.set('@P.z');
		color1.p.color.g.set('@P.y');
		color1.p.color.b.set('@P.x');

		container = await color1.compute();
		core_group = container.coreContent()!;
		geometry = core_group.threejsObjectsWithGeo()[0].geometry;
		array = (geometry.getAttribute('color') as BufferAttribute).array;
		assert.equal(
			array.join(','),
			[
				1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1,
				1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0,
				0, 0,
			].join(',')
		);
	});

	qUnit.test('sop/color with non entity dependent expression', async (assert) => {
		const geo1 = window.geo1;

		const sphere1 = geo1.createNode('sphere');
		const box1 = geo1.createNode('box');
		const color1 = geo1.createNode('color');
		color1.setInput(0, box1);

		color1.p.color.r.set(`ch('../${sphere1.name()}/radius')`);

		async function getColors() {
			const container = await color1.compute();
			const core_group = container.coreContent()!;
			const geometry = core_group.threejsObjectsWithGeo()[0].geometry;

			const array = (geometry.getAttribute('color') as BufferAttribute).array;
			return array;
		}

		assert.equal((await getColors())[0], 1);

		sphere1.p.radius.set(2);
		assert.equal((await getColors())[0], 2);
	});
}
