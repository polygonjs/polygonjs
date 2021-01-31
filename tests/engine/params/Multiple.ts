QUnit.test('multiple keep their default and also for their components', async (assert) => {
	const geo1 = window.geo1;

	const param = geo1.p.t;
	param.set([0.2, 0.7, 1]);
	assert.deepEqual(param.value.toArray(), [0.2, 0.7, 1]);
	assert.equal(param.x.value, 0.2);
	assert.equal(param.y.value, 0.7);
	assert.equal(param.z.value, 1);

	// change only one component
	param.x.set(0.4);
	assert.deepEqual(param.value.toArray(), [0.4, 0.7, 1]);
	assert.equal(param.x.value, 0.4);

	// reset the multiple param to default
	param.set(param.default_value);
	assert.deepEqual(param.value.toArray(), [0, 0, 0]);
	assert.equal(param.x.value, 0);
	assert.equal(param.y.value, 0);
	assert.equal(param.z.value, 0);

	// change again only one component
	param.x.set(0.5);
	assert.deepEqual(param.value.toArray(), [0.5, 0, 0]);
	assert.equal(param.x.value, 0.5);
	assert.equal(param.y.value, 0);
	assert.equal(param.z.value, 0);

	// reset the component to default
	param.x.set(param.x.default_value);
	assert.deepEqual(param.value.toArray(), [0, 0, 0]);
	assert.equal(param.x.value, 0);
	assert.equal(param.y.value, 0);
	assert.equal(param.z.value, 0);
});

QUnit.test('color keep their default and also for their components', async (assert) => {
	const scene = window.scene;

	const hemisphere_light1 = scene.root().createNode('hemisphereLight');

	const param = hemisphere_light1.p.skyColor;
	assert.deepEqual(param.valuePreConversion().toArray(), [1, 1, 1]);
	assert.equal(param.valuePreConversion().r, 1);
	assert.equal(param.valuePreConversion().g, 1);
	assert.equal(param.valuePreConversion().b, 1);
	assert.in_delta(param.value.r, 1, 0.1);
	assert.in_delta(param.value.g, 1, 0.1);
	assert.in_delta(param.value.b, 1, 0.1);

	// change only one component
	param.r.set(0.4);
	assert.deepEqual(param.valuePreConversion().toArray(), [0.4, 1, 1]);
	assert.equal(param.valuePreConversion().r, 0.4);
	assert.equal(param.valuePreConversion().g, 1);
	assert.equal(param.valuePreConversion().b, 1);
	assert.in_delta(param.value.r, 0.13, 0.1);
	assert.in_delta(param.value.g, 1, 0.1);
	assert.in_delta(param.value.b, 1, 0.1);

	// reset the component to default
	param.r.set(param.r.default_value);
	assert.deepEqual(param.valuePreConversion().toArray(), [1, 1, 1]);
	assert.equal(param.valuePreConversion().r, 1);
	assert.equal(param.valuePreConversion().g, 1);
	assert.equal(param.valuePreConversion().b, 1);
});
