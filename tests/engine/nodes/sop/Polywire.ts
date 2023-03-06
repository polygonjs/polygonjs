import {Vector3, Box3} from 'three';
const tmpBox = new Box3();
const tmpSize = new Vector3();
QUnit.test('polywire simple', async (assert) => {
	const geo1 = window.geo1;

	const circle1 = geo1.createNode('circle');
	const polywire1 = geo1.createNode('polywire');

	polywire1.setInput(0, circle1);

	async function computeCircle() {
		const container = await circle1.compute();
		const coreGroup = container.coreContent()!;
		coreGroup.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);

		return {bbox: tmpBox, size: tmpSize, pointsCount: coreGroup.pointsCount()};
	}
	async function computePolywire() {
		const container = await polywire1.compute();
		const coreGroup = container.coreContent()!;
		coreGroup.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);

		return {bbox: tmpBox, size: tmpSize, pointsCount: coreGroup.pointsCount()};
	}

	assert.equal((await computeCircle()).pointsCount, 12);

	polywire1.p.closed.set(0);
	assert.equal((await computePolywire()).pointsCount, 192);
	assert.equal((await computePolywire()).size.y, 2, 'bbox');

	polywire1.p.closed.set(1);
	assert.equal((await computePolywire()).pointsCount, 208);
	assert.equal((await computePolywire()).size.y, 2, 'bbox');

	polywire1.p.radius.set(0.5);
	assert.equal((await computePolywire()).pointsCount, 208);
	assert.equal((await computePolywire()).size.y, 1, 'bbox');
});

QUnit.test('polywire preserves attributes', async (assert) => {
	const geo1 = window.geo1;

	const circle1 = geo1.createNode('circle');
	const attribCreate1 = geo1.createNode('attribCreate');
	const attribCreate2 = geo1.createNode('attribCreate');
	const polywire1 = geo1.createNode('polywire');

	attribCreate1.setInput(0, circle1);
	attribCreate2.setInput(0, attribCreate1);
	polywire1.setInput(0, attribCreate2);

	attribCreate1.p.size.set(1);
	attribCreate1.p.name.set('t');
	attribCreate1.p.value1.set(0.5);

	attribCreate2.p.size.set(3);
	attribCreate2.p.name.set('v');
	attribCreate2.p.value3.set([1.5, 7, 5]);

	polywire1.p.closed.set(0);

	const container = await polywire1.compute();
	const point = container.coreContent()?.points()[0]!;
	assert.equal(point.attribValue('t'), 0.5);
	assert.deepEqual((point.attribValue('v') as Vector3).toArray(), [1.5, 7, 5]);
});
