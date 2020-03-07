QUnit.test('expression str_chars_count simple', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.create_node('plane');
	const sizex_param = plane1.p.size.x;

	sizex_param.set('str_chars_count( "test test" )');
	await plane1.p.sizex.compute();
	assert.equal(plane1.p.sizex.value, 9);

	sizex_param.set('str_chars_count( "test test12" )');
	await plane1.p.sizex.compute();
	assert.equal(plane1.p.sizex.value, 11);

	// create a text and apply expression to it's text attribute
	const text1 = geo1.create_node('text');
	text1.set_name('text1');
	assert.equal(text1.name, 'text1');
	sizex_param.set('str_chars_count( ch("../text1/text") )');

	text1.p.text.set('demo');
	await plane1.p.sizex.compute();
	assert.equal(plane1.p.sizex.value, 4);

	text1.p.text.set('a much longer text');
	await plane1.p.sizex.compute();
	assert.equal(plane1.p.sizex.value, 18);
});
