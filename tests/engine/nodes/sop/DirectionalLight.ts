import type {QUnit} from '../../../helpers/QUnit';
import {DirectionalLight, Object3D} from 'three';
import {ColorConversion} from '../../../../src/core/Color';
import {BaseSopNodeType} from '../../../../src/engine/nodes/sop/_Base';
export function testenginenodessopDirectionalLight(qUnit: QUnit) {

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
async function getObject(node: BaseSopNodeType) {
	const container = await node.compute();
	const coreGroup = container.coreContent();
	const object = coreGroup?.threejsObjects()[0]!;
	return object;
}

qUnit.test('sop/directionalLight hierarchy is maintained as it is cloned', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const directionalLight1 = geo1.createNode('directionalLight');
	const transform1 = geo1.createNode('transform');

	directionalLight1.p.showHelper.set(true);
	directionalLight1.p.color.set([0.2, 0.4, 0.7]);
	directionalLight1.p.color.options.setOption('conversion', ColorConversion.NONE);
	transform1.setInput(0, directionalLight1);

	const object1 = await getObject(directionalLight1);
	assert.equal(objectsCount(object1), 6);
	assert.deepEqual(objectNames(object1), [
		'DirectionalLightContainer_directionalLight1',
		'directionalLight1',
		'DirectionalLightTarget_directionalLight1',
		'CoreDirectionalLightHelper_directionalLight1',
		'CoreDirectionalLightHelperSquare_directionalLight1',
		'CoreDirectionalLightHelperCameraHelper_directionalLight1',
	]);
	assert.deepEqual((object1.children[0] as DirectionalLight).color.toArray(), [0.2, 0.4, 0.7]);

	const object2 = await getObject(transform1);
	assert.equal(objectsCount(object2), 6);
	assert.deepEqual(objectNames(object2), [
		'DirectionalLightContainer_directionalLight1',
		'directionalLight1',
		'DirectionalLightTarget_directionalLight1',
		'CoreDirectionalLightHelper_directionalLight1',
		'CoreDirectionalLightHelperSquare_directionalLight1',
		'CoreDirectionalLightHelperCameraHelper_directionalLight1',
	]);
	assert.deepEqual((object2.children[0] as DirectionalLight).color.toArray(), [0.2, 0.4, 0.7]);
});

}