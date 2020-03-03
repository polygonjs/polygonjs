QUnit.test('multiple keep their default and also for their components', async (assert) => {
	const scene = window.scene;

	const hemisphere_light1 = scene.root.create_node('hemisphere_light');

	const param = hemisphere_light1.p.sky_color;
	assert.deepEqual(param.value.toArray(), [0.2, 0.7, 1]);
	assert.equal(param.r.value, 0.2);
	assert.equal(param.g.value, 0.7);
	assert.equal(param.b.value, 1);

	// change only one component
	param.r.set(0.4);
	assert.deepEqual(param.value.toArray(), [0.4, 0.7, 1]);
	assert.equal(param.r.value, 0.4);

	// reset the multiple param to default
	param.set(param.default_value);
	assert.deepEqual(param.value.toArray(), [0.2, 0.7, 1]);
	assert.equal(param.r.value, 0.2);
	assert.equal(param.g.value, 0.7);
	assert.equal(param.b.value, 1);

	// change again only one component
	param.r.set(0.5);
	assert.deepEqual(param.value.toArray(), [0.5, 0.7, 1]);
	assert.equal(param.r.value, 0.5);
	assert.equal(param.g.value, 0.7);
	assert.equal(param.b.value, 1);

	// reset the component to default
	param.r.set(param.r.default_value);
	assert.deepEqual(param.value.toArray(), [0.2, 0.7, 1]);
	assert.equal(param.r.value, 0.2);
	assert.equal(param.g.value, 0.7);
	assert.equal(param.b.value, 1);
});
