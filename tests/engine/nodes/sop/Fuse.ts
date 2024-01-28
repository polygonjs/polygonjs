import type {QUnit} from '../../../helpers/QUnit';
import {BufferAttribute} from 'three';
import {BaseSopNodeType} from '../../../../src/engine/nodes/sop/_Base';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {range} from '../../../../src/core/ArrayUtils';
export function testenginenodessopFuse(qUnit: QUnit) {
	qUnit.test('fuse simple', async (assert) => {
		const geo1 = window.geo1;

		const box1 = geo1.createNode('box');
		const bbox_scatter1 = geo1.createNode('bboxScatter');
		const fuse1 = geo1.createNode('fuse');

		bbox_scatter1.setInput(0, box1);
		fuse1.setInput(0, bbox_scatter1);

		let container;

		container = await bbox_scatter1.compute();
		assert.equal(container.coreContent()!.pointsCount(), 1331);

		container = await fuse1.compute();
		assert.equal(container.coreContent()!.pointsCount(), 1331);

		fuse1.p.dist.set(0.4);
		container = await fuse1.compute();
		assert.equal(container.coreContent()!.pointsCount(), 27);

		fuse1.p.dist.set(0.2);
		container = await fuse1.compute();
		assert.equal(container.coreContent()!.pointsCount(), 216);
	});

	async function getIndex(node: BaseSopNodeType) {
		const container = await node.compute();
		const object = container.coreContent()!.threejsObjectsWithGeo()[0];
		return [...object.geometry.getIndex()!.array];
	}
	async function getPosition(node: BaseSopNodeType) {
		const container = await node.compute();
		const object = container.coreContent()!.threejsObjectsWithGeo()[0];
		return [...(object.geometry.getAttribute('position')! as BufferAttribute).array];
	}

	qUnit.test('fuse on simple mesh', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const transform1 = geo1.createNode('transform');
		const fuse1 = geo1.createNode('fuse');

		transform1.setInput(0, plane1);
		fuse1.setInput(0, transform1);

		transform1.p.pointGroup.set('0');
		transform1.p.t.set([0.96, 0, 0]);

		fuse1.p.dist.set(0.3);
		assert.deepEqual(await getIndex(fuse1), [0, 1, 2]);
		assert.deepEqual((await getPosition(fuse1)).length, 9);

		fuse1.p.dist.set(2);
		assert.deepEqual(await getIndex(fuse1), []);
		assert.deepEqual((await getPosition(fuse1)).length, 0);
	});

	qUnit.test('fuse on simple line', async (assert) => {
		const geo1 = window.geo1;

		const line1 = geo1.createNode('line');
		const fuse1 = geo1.createNode('fuse');

		fuse1.setInput(0, line1);
		line1.p.direction.set([0.1, 0.2, 0.5]);
		line1.p.pointsCount.set(100);

		fuse1.p.dist.set(0.1);
		assert.deepEqual(
			await getIndex(fuse1),
			[0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13]
		);

		fuse1.p.dist.set(0.3);
		assert.deepEqual(await getIndex(fuse1), [0, 1, 1, 2, 2, 3, 3, 4]);

		fuse1.p.dist.set(0.5);
		assert.deepEqual(await getIndex(fuse1), [0, 1, 1, 2, 2, 3]);
	});

	qUnit.test('fuse on simple points', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const scatter1 = geo1.createNode('scatter');
		const fuse1 = geo1.createNode('fuse');

		scatter1.setInput(0, plane1);
		fuse1.setInput(0, scatter1);

		fuse1.p.dist.set(0.3);
		assert.deepEqual(await getIndex(fuse1), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);

		fuse1.p.dist.set(0.5);
		assert.deepEqual(await getIndex(fuse1), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
	});

	qUnit.test('fuse on simple sphere + delete', async (assert) => {
		const geo1 = window.geo1;

		const sphere1 = geo1.createNode('sphere');
		const delete1 = geo1.createNode('delete');
		const fuse1 = geo1.createNode('fuse');

		delete1.setInput(0, sphere1);
		fuse1.setInput(0, delete1);

		sphere1.p.resolution.set([5, 5]);
		delete1.setAttribClass(AttribClass.OBJECT);
		delete1.p.invert.set(true);
		delete1.p.keepPoints.set(true);

		fuse1.p.dist.set(0.5);
		const _range: number[] = [];
		range(0, 22, 1, _range);
		assert.deepEqual(await getIndex(fuse1), _range);

		fuse1.p.dist.set(0.75);
		range(0, 15, 1, _range);
		assert.deepEqual(await getIndex(fuse1), _range);

		fuse1.p.dist.set(1);
		range(0, 13, 1, _range);
		assert.deepEqual(await getIndex(fuse1), _range);

		fuse1.p.dist.set(1.5);
		range(0, 6, 1, _range);
		assert.deepEqual(await getIndex(fuse1), _range);

		fuse1.p.dist.set(1.9);
		range(0, 4, 1, _range);
		assert.deepEqual(await getIndex(fuse1), _range);
	});
}
