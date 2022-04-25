import {Object3D} from 'three';

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

QUnit.test('sop/areaLight hierarchy is maintained as it is cloned', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const areaLight1 = geo1.createNode('areaLight');
	const transform1 = geo1.createNode('transform');

	areaLight1.p.showHelper.set(true);
	areaLight1.p.width.set(3);
	areaLight1.p.height.set(2);
	transform1.setInput(0, areaLight1);

	let container = await areaLight1.compute();
	let coreGroup = container.coreContent();
	let object = coreGroup?.objects()[0]!;
	assert.equal(objectsCount(object), 4);
	assert.deepEqual(objectNames(object), [
		'AreaLightGroup_areaLight1',
		'AreaLight_areaLight1',
		'CoreRectAreaLightHelper_areaLight1',
		'CoreRectAreaLightHelperChildMesh_areaLight1',
	]);
	assert.deepEqual(object.children[1].scale.toArray(), [3, 2, 1]);

	container = await transform1.compute();
	coreGroup = container.coreContent();
	object = coreGroup?.objects()[0]!;
	assert.equal(objectsCount(object), 4);
	assert.deepEqual(objectNames(object), [
		'AreaLightGroup_areaLight1',
		'AreaLight_areaLight1',
		'CoreRectAreaLightHelper_areaLight1',
		'CoreRectAreaLightHelperChildMesh_areaLight1',
	]);
	assert.deepEqual(object.children[1].scale.toArray(), [3, 2, 1]);
});
