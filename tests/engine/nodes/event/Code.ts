QUnit.test('event code simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const box2 = geo1.create_node('box');
	assert.equal(box1.name, 'box1');
	assert.equal(box2.name, 'box2');

	const box2_sibbling = box2.node_sibbling('box1')!;
	assert.equal(box2_sibbling.graph_node_id, box1.graph_node_id);
	// TODO: this test isn't complete at all
});
