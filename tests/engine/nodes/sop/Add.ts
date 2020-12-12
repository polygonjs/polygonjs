QUnit.test('add simple', async (assert) => {
	const geo1 = window.geo1;
	const add1 = geo1.createNode('add');

	const container = await add1.request_container();
	const core_group = container.core_content()!;
	assert.equal(core_group.points().length, 1);
});
