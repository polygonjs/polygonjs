import {Object3D} from 'three/src/core/Object3D';

function objectsCount(object: Object3D, countStart: number = 0) {
	countStart += 1;
	for (let child of object.children) {
		countStart += objectsCount(child);
	}
	return countStart;
}
function objectNames(object: Object3D, names: string[] = []) {
	names.push(object.name);
	for (let child of object.children) {
		objectNames(child, names);
	}
	return names;
}

QUnit.test('sop/ambientLight hierarchy is maintained as it is cloned', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const ambientLight1 = geo1.createNode('ambientLight');
	const transform1 = geo1.createNode('transform');

	transform1.setInput(0, ambientLight1);

	let container = await ambientLight1.compute();
	let coreGroup = container.coreContent();
	let object = coreGroup?.objects()[0]!;
	assert.equal(objectsCount(object), 1);
	assert.deepEqual(objectNames(object), ['AmbientLight_ambientLight1']);

	container = await transform1.compute();
	coreGroup = container.coreContent();
	object = coreGroup?.objects()[0]!;
	assert.equal(objectsCount(object), 1);
	assert.deepEqual(objectNames(object), ['AmbientLight_ambientLight1']);
});
