QUnit.test('event code simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');
	assert.equal(box1.name(), 'box1');
	assert.equal(box2.name(), 'box2');

	const box2_sibling = box2.nodeSibling('box1')!;
	assert.equal(box2_sibling.graphNodeId(), box1.graphNodeId());
	// TODO: this test isn't complete at all
});
