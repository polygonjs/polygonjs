QUnit.test('delete simple', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.create_node('plane');
	const delete1 = geo1.create_node('delete');
	delete1.set_input(0, plane1);
	delete1.p.by_expression.set(1);

	let container = await delete1.request_container();
	assert.equal(container.points_count(), 3);

	delete1.p.expression.set('@ptnum==1 || @ptnum==0');

	container = await delete1.request_container();
	assert.equal(container.points_count(), 2);
});
