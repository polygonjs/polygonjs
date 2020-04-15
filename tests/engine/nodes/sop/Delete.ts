QUnit.test('delete simple plane', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.create_node('plane');
	const delete1 = geo1.create_node('delete');
	delete1.set_input(0, plane1);
	delete1.p.by_expression.set(1);

	let container = await delete1.request_container();
	assert.equal(container.points_count(), 3);

	// the points of one face remain if deleting a single point
	delete1.p.expression.set('@ptnum==0');
	container = await delete1.request_container();
	assert.equal(container.points_count(), 3);

	// all 4 points removed if deleting one 2 of them, since that deletes both faces
	delete1.p.expression.set('@ptnum==1 || @ptnum==0');
	container = await delete1.request_container();
	assert.equal(container.points_count(), 0);
});

QUnit.test('delete simple box', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const delete1 = geo1.create_node('delete');
	delete1.set_input(0, box1);
	delete1.p.by_expression.set(1);

	let container = await delete1.request_container();
	assert.equal(container.points_count(), 33); // mm, I'd expect 21 instead. I could probably optimize the geometry creation from the kept points

	// only the top points remain
	delete1.p.expression.set('@P.y<0');
	container = await delete1.request_container();
	assert.equal(container.points_count(), 6);
});
