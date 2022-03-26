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

QUnit.test('sop/directionalLight hierarchy is maintained as it is cloned', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const directionalLight1 = geo1.createNode('directionalLight');
	const transform1 = geo1.createNode('transform');

	directionalLight1.p.showHelper.set(true);
	transform1.setInput(0, directionalLight1);

	let container = await directionalLight1.compute();
	let coreGroup = container.coreContent();
	let object = coreGroup?.objects()[0]!;
	assert.equal(objectsCount(object), 6);
	assert.deepEqual(objectNames(object), [
		'DirectionalLightContainer_directionalLight1',
		'DirectionalLight_directionalLight1',
		'DirectionalLightTarget_directionalLight1',
		'CoreDirectionalLightHelper_directionalLight1',
		'CoreDirectionalLightHelperSquare_directionalLight1',
		'CoreDirectionalLightHelperCameraHelper_directionalLight1',
	]);

	container = await transform1.compute();
	coreGroup = container.coreContent();
	object = coreGroup?.objects()[0]!;
	assert.equal(objectsCount(object), 6);
	assert.deepEqual(objectNames(object), [
		'DirectionalLightContainer_directionalLight1',
		'DirectionalLight_directionalLight1',
		'DirectionalLightTarget_directionalLight1',
		'CoreDirectionalLightHelper_directionalLight1',
		'CoreDirectionalLightHelperSquare_directionalLight1',
		'CoreDirectionalLightHelperCameraHelper_directionalLight1',
	]);
});
