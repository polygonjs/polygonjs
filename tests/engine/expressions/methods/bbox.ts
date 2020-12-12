QUnit.test('expression bbox works with path', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	assert.equal(box1.name, 'box1');
	const box2 = geo1.createNode('box');

	box2.p.size.set(`bbox('../${box1.name}', 'min', 'x')`);

	await box2.p.size.compute();
	assert.equal(box2.p.size.value, -0.5);
});

// test "expression bbox works with input index", ->
// 	box1 = geo1.createNode('box')
// 	box2 = geo1.createNode('box')

// 	box2.set_input(0, box1)

// 	box2.param('size').set_expression("npoints(0)")

// 	box2.param('size').eval (val)=>
// 		assert.equal val, 24

// 		done()

// test "expression bbox fails with bad path", ->
// 	box1 = geo1.createNode('box')
// 	box2 = geo1.createNode('box')

// 	box2.set_input(0, box1)

// 	box2.param('size').set_expression("npoints('../doesnotexist')")

// 	box2.param('size').eval =>
// 		assert.equal box2.error_message(), "param size error: expression npoints error: no node found for argument ../doesnotexist"

// 		done()

// test "expression bbox fails with bad input index 1", ->
// 	box1 = geo1.createNode('box')
// 	box2 = geo1.createNode('box')

// 	box2.set_input(0, box1)

// 	box2.param('size').set_expression("npoints(1)")

// 	box2.param('size').eval =>
// 		assert.equal box2.error_message(), "param size error: expression npoints error: no node found for argument 1"

// 		done()

// test "expression bbox fails with bad input index 0", ->
// 	box1 = geo1.createNode('box')
// 	box2 = geo1.createNode('box')

// 	box2.param('size').set_expression("npoints(0)")

// 	box2.param('size').eval =>
// 		assert.equal box2.param('size').error_message(), "expression npoints error: no node found for argument 0"
// 		assert.equal box2.error_message(), "param size error: expression npoints error: no node found for argument 0"

// 		box2.set_input(0, box1)

// 		box2.param('size').eval =>

// 			assert_null box2.param('size').error_message()
// 			assert.equal box2.error_message(), "param size error: expression npoints error: no node found for argument 0"

// 			box2.request_container =>
// 				assert_null box2.error_message()

// 				done()
