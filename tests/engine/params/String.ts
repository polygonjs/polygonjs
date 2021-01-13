QUnit.test('a string is set dirty if it refers another param with ch and it changes', async (assert) => {
	const geo1 = window.geo1;
	const text1 = geo1.createNode('text');
	const text2 = geo1.createNode('text');
	const text3 = geo1.createNode('text');
	const text1_param = text1.p.text;
	const text2_param = text2.p.text;
	const text3_param = text3.p.text;
	const text1_name = text1.name;
	const text2_name = text2.name;
	text1_param.set('this is a test');
	text2_param.set('another');

	text3_param.set('`1+1`');
	await text3_param.compute();
	assert.equal(text3_param.value, '2');

	text3_param.set('ok `ch("../' + text1_name + '/text")` middle `ch("../' + text2_name + '/text")` end');
	await text3_param.compute();
	assert.equal(text3_param.value, 'ok this is a test middle another end');
	text1_param.set('this is a change');
	await text3_param.compute();
	assert.equal(text3_param.value, 'ok this is a change middle another end');
	text2_param.set('this is another change');
	await text3_param.compute();
	assert.equal(text3_param.value, 'ok this is a change middle this is another change end');
});
QUnit.test('a string of `$F` will make the param frame dependent', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const text = geo1.createNode('text');
	const text_param = text.p.text;
	text_param.set('`$F*2+1`');
	await text_param.compute();
	assert.equal(text_param.value, '3');
	scene.timeController.setFrame(2);
	await text_param.compute();
	assert.equal(text_param.value, '5');
	scene.timeController.setFrame(3);
	await text_param.compute();
	assert.equal(text_param.value, '7');
});

QUnit.test('set as a number will convert to string', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	transform1.setInput(0, box1);

	transform1.p.group.set((<unknown>12) as string);
	assert.equal(transform1.p.group.value, '12');
});

QUnit.test('a string can have multiple expression and maintain dependencies', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const text1 = geo1.createNode('text');
	const text2 = geo1.createNode('text');
	const text1_param = text1.p.text;
	const text2_param = text2.p.text;
	const text1_name = text1.name;
	text1_param.set('this is a test');
	text2_param.set('ok `ch("../' + text1_name + '/text")` middle `pow($F*3,2)` end');
	await text2_param.compute();
	assert.equal(text2_param.value, 'ok this is a test middle 9 end');
	scene.timeController.setFrame(2);
	await text2_param.compute();
	assert.equal(text2_param.value, 'ok this is a test middle 36 end');
	scene.timeController.setFrame(3);
	await text2_param.compute();
	assert.equal(text2_param.value, 'ok this is a test middle 81 end');
	assert.equal(text2_param.graphPredecessors().length, 2);

	// test updating the string param
	const text3 = geo1.createNode('text');
	text3.p.text.set(' - this is text3 - ');
	const text3_name = text3.name;
	text2_param.set('text3: `ch("../' + text3_name + '/text")` middle `$F*3` end');
	await text2_param.compute();
	assert.equal(text2_param.value, 'text3:  - this is text3 -  middle 9 end');
	// assert.equal(text2_param.graphPredecessors().length, 2);

	// // now just the frame
	// text2_param.set('`$F`');
	// await text2_param.compute();
	// assert.equal(text2_param.value, '3');
	// scene.time_controller.increment_frame();
	// await text2_param.compute();
	// assert.equal(text2_param.value, '4');
	// assert.equal(text2_param.graphPredecessors().length, 1);

	// // test removing expressions from the string param
	// text2_param.set('a simple string');
	// assert.equal(text2_param.graphPredecessors().length, 0);
	// await text2_param.compute();
	// assert.equal(text2_param.value, 'a simple string');
});
