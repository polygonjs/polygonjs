QUnit.skip('a param sets its node to timedependent and back', (assert) => {});

// assert !geo1.is_time_dependent()

// tx = geo1.param('tx')
// ty = geo1.param('ty')
// assert !tx.is_time_dependent()
// assert !ty.is_time_dependent()

// await geo1.eval_all_params()
// 	#
// assert !tx.is_dirty()
// assert !ty.is_dirty()

// tx.set_expression("$F+1")
// assert tx.is_dirty()
// assert !ty.is_dirty()
// assert geo1.is_dirty()
// assert !geo1.is_time_dependent()

// scene.context().set_frame(1)

// val = await tx.eval_p()
// assert.equal val, 2
// assert tx.is_time_dependent()
// assert geo1.is_time_dependent()

// scene.context().set_frame(2)
// val = await tx.eval_p()
// assert.equal val, 3

// ty.set_expression("$F+3")
// await ty.eval_p()
// assert geo1.is_time_dependent()

// tx.set_expression("1+1")
// await tx.eval_p()
// assert geo1.is_time_dependent()

// ty.set_expression("1+3")
// await ty.eval_p()
// assert !geo1.is_time_dependent()

// done()

QUnit.test('a param sets its node to timedependent and a scene time change sets the node to dirty', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node display_node_controller

	const box1 = geo1.create_node('box');

	const size = box1.p.size;
	assert.ok(!size.states.time_dependent.active);

	await box1.request_container();

	// sets the node as dirty
	assert.ok(!box1.is_dirty);
	scene.time_controller.increment_time();
	assert.ok(!box1.is_dirty);

	size.set('$F+1');
	assert.ok(size.is_dirty);
	assert.ok(box1.states.time_dependent.active);

	await box1.request_container();

	assert.ok(!box1.is_dirty);
	scene.time_controller.increment_time();
	assert.ok(box1.is_dirty);
});
