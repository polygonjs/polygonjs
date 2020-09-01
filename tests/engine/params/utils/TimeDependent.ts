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

	size.set('17');
	assert.ok(!size.is_dirty);
	assert.ok(box1.is_dirty);
	assert.ok(!box1.states.time_dependent.active);
	await box1.request_container();
	assert.ok(!box1.is_dirty);
	scene.time_controller.increment_time();
	assert.ok(!box1.is_dirty);
});

QUnit.test('a param value is updated is it is time dependent', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node display_node_controller

	const box1 = geo1.create_node('box');
	const size = box1.p.size;

	size.set('2*$T');
	assert.equal(size.graph_all_predecessors().length, 1);
	assert.equal(size.graph_all_predecessors()[0].graph_node_id, scene.time_controller.graph_node.graph_node_id);
	assert.equal(scene.time_controller.graph_node.graph_successors().length, 1);
	assert.equal(scene.time_controller.graph_node.graph_successors()[0].graph_node_id, size.graph_node_id);
	await size.compute();
	assert.equal(size.value, 0);

	scene.set_frame(12);
	await size.compute();
	assert.equal(size.value, 0.4);

	scene.set_frame(120);
	await size.compute();
	assert.equal(size.value, 4);

	size.set('2');
	assert.equal(size.graph_all_predecessors().length, 0);
	assert.equal(scene.time_controller.graph_node.graph_successors().length, 0);
});

QUnit.test('a node with 2 params can be time dependent', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node display_node_controller

	const rx = geo1.p.r.x;
	const ry = geo1.p.r.y;
	const time_graph_node = scene.time_controller.graph_node;

	rx.set('5*sin($T*0.5+687) + 2.5*cos($T-12)');
	assert.equal(rx.graph_all_predecessors().length, 1);
	assert.equal(rx.graph_all_predecessors()[0].graph_node_id, time_graph_node.graph_node_id);
	assert.equal(ry.graph_all_predecessors().length, 0);
	assert.equal(time_graph_node.graph_successors().length, 1);
	assert.deepEqual(
		time_graph_node
			.graph_successors()
			.map((n) => n.graph_node_id)
			.sort(),
		[rx].map((n) => n.graph_node_id)
	);

	ry.set('5*sin($T*0.45+541) + 2.5*cos($T+6541654)');
	assert.equal(rx.graph_all_predecessors().length, 1);
	assert.equal(rx.graph_all_predecessors()[0].graph_node_id, time_graph_node.graph_node_id);
	assert.equal(ry.graph_all_predecessors().length, 1);
	assert.equal(ry.graph_all_predecessors()[0].graph_node_id, time_graph_node.graph_node_id);
	assert.equal(time_graph_node.graph_successors().length, 2);
	assert.deepEqual(
		time_graph_node
			.graph_successors()
			.map((n) => n.graph_node_id)
			.sort(),
		[rx, ry].map((n) => n.graph_node_id)
	);

	rx.set(3);
	assert.equal(rx.graph_all_predecessors().length, 0);
	assert.equal(ry.graph_all_predecessors().length, 1);
	assert.equal(ry.graph_all_predecessors()[0].graph_node_id, time_graph_node.graph_node_id);
	assert.equal(time_graph_node.graph_successors().length, 1);
	assert.deepEqual(
		time_graph_node
			.graph_successors()
			.map((n) => n.graph_node_id)
			.sort(),
		[ry].map((n) => n.graph_node_id)
	);

	ry.set(2);
	assert.equal(rx.graph_all_predecessors().length, 0);
	assert.equal(ry.graph_all_predecessors().length, 0);
	assert.equal(time_graph_node.graph_successors().length, 0);
});
