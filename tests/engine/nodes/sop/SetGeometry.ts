import {ObjectType} from '../../../../src/core/geometry/Constant';

QUnit.test('setGeometry simple', async (assert) => {
	const geo1 = window.geo1;

	const emptyObject1 = geo1.createNode('emptyObject');
	const box1 = geo1.createNode('box');
	const sphere1 = geo1.createNode('sphere');
	const switch1 = geo1.createNode('switch');
	const emptyObject2 = geo1.createNode('emptyObject');
	const setGeometry1 = geo1.createNode('setGeometry');

	emptyObject1.setObjectType(ObjectType.MESH);
	emptyObject2.setObjectType(ObjectType.MESH);
	switch1.setInput(0, box1);
	switch1.setInput(1, sphere1);
	switch1.setInput(2, emptyObject2);
	switch1.p.input.set(2);
	setGeometry1.setInput(0, emptyObject1);
	setGeometry1.setInput(1, switch1);

	async function pointsCount() {
		const container = await setGeometry1.compute();

		const objects = container.coreContent()!.objectsWithGeo();
		const firstObject = objects[0];
		if (!firstObject) {
			return 0;
		}
		if (!firstObject.geometry) {
			return 0;
		}
		return firstObject.geometry.getAttribute('position')?.count || 0;
	}

	assert.equal(await pointsCount(), 0);
	switch1.p.input.set(1);
	assert.equal(await pointsCount(), 961);
	switch1.p.input.set(0);
	assert.equal(await pointsCount(), 24);
});
