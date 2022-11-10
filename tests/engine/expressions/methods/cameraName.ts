QUnit.test('expression/cameraName with node path', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const perspectiveCamera1 = geo1.createNode('perspectiveCamera');
	const box2 = geo1.createNode('box');
	const perspectiveCamera2 = geo1.createNode('perspectiveCamera');
	const merge1 = geo1.createNode('merge');
	const null1 = geo1.createNode('null');

	const text1 = geo1.createNode('text');

	null1.setInput(0, merge1);
	merge1.setInput(0, box1);
	merge1.setInput(1, perspectiveCamera1);

	const param = text1.p.text;
	param.set(`\`cameraName('${null1.path()}', camerasCount('${null1.path()}')-1 )\``);

	await param.compute();
	assert.equal(param.value, 'perspectiveCamera1');

	merge1.setInput(2, box2);
	merge1.setInput(2, perspectiveCamera2);
	await param.compute();
	assert.equal(param.value, 'perspectiveCamera2');
});

QUnit.test('expression/cameraName with index', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const perspectiveCamera1 = geo1.createNode('perspectiveCamera');
	const box2 = geo1.createNode('box');
	const perspectiveCamera2 = geo1.createNode('perspectiveCamera');
	const merge1 = geo1.createNode('merge');

	const transform1 = geo1.createNode('transform');

	merge1.setInput(0, box1);
	merge1.setInput(1, perspectiveCamera1);
	transform1.setInput(0, merge1);

	const param = transform1.p.group;
	param.set(`\`cameraName(0, camerasCount(0)-1)\``);

	await param.compute();
	assert.equal(param.value, 'perspectiveCamera1');

	merge1.setInput(2, box2);
	merge1.setInput(2, perspectiveCamera2);
	await param.compute();
	assert.equal(param.value, 'perspectiveCamera2');
});
