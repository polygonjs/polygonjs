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

QUnit.test('sop/spotLight hierarchy is maintained as it is cloned', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const spotLight1 = geo1.createNode('spotLight');
	const transform1 = geo1.createNode('transform');

	spotLight1.p.showHelper.set(true);
	spotLight1.p.tvolumetric.set(true);
	transform1.setInput(0, spotLight1);

	let container = await spotLight1.compute();
	let coreGroup = container.coreContent();
	let object = coreGroup?.objects()[0]!;
	assert.equal(objectsCount(object), 6);
	assert.deepEqual(objectNames(object), [
		'SpotLightContainer_spotLight1',
		'SpotLight_spotLight1',
		'VolumetricSpotLight_spotLight1',
		'SpotLightDefaultTarget_spotLight1',
		'CoreSpotLightHelper_spotLight1',
		'CoreSpotLightHelperCone_spotLight1',
	]);

	container = await transform1.compute();
	coreGroup = container.coreContent();
	object = coreGroup?.objects()[0]!;
	assert.equal(objectsCount(object), 6);
	assert.deepEqual(objectNames(object), [
		'SpotLightContainer_spotLight1',
		'SpotLight_spotLight1',
		'VolumetricSpotLight_spotLight1',
		'SpotLightDefaultTarget_spotLight1',
		'CoreSpotLightHelper_spotLight1',
		'CoreSpotLightHelperCone_spotLight1',
	]);
});
