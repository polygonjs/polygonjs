QUnit.test('sop/convexHull simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	const merge1 = geo1.createNode('merge');
	const convexHull1 = geo1.createNode('convexHull');

	transform1.setInput(0, box2);
	merge1.setInput(0, box1);
	merge1.setInput(1, transform1);
	convexHull1.setInput(0, merge1);

	merge1.setCompactMode(true);

	async function _compute() {
		const container = await convexHull1.compute();
		const coreGroup = container.coreContent();
		const geometry = coreGroup?.objectsWithGeo()[0].geometry;
		const pos = geometry?.getAttribute('position')!;
		const pointsCount = pos.array.length / 3;
		return {pointsCount};
	}

	assert.equal((await _compute()).pointsCount, 36);
	transform1.p.t.y.set(2);
	assert.equal((await _compute()).pointsCount, 54);

	transform1.p.r.y.set(45);
	assert.equal((await _compute()).pointsCount, 84);
});
