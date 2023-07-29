import type {QUnit} from '../../../helpers/QUnit';
import {Light} from 'three';
import {GeometryContainer} from '../../../../src/engine/containers/Geometry';
export function testenginenodessopLightMixer(qUnit: QUnit) {

function getLight(container: GeometryContainer, lightName: string): Light | undefined {
	const coreGroup = container.coreContent()!;
	const objects = coreGroup.threejsObjects();
	let light: Light | undefined;
	for (let object of objects) {
		object.traverse((child) => {
			if (child.name == lightName) {
				light = child as Light;
			}
		});
	}
	return light;
}

qUnit.test('sop/lightMixer', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const ambientLight1 = geo1.createNode('ambientLight');
	const areaLight1 = geo1.createNode('areaLight');
	const directionalLight1 = geo1.createNode('directionalLight');
	const hemisphereLight1 = geo1.createNode('hemisphereLight');
	const pointLight1 = geo1.createNode('pointLight');
	const spotLight1 = geo1.createNode('spotLight');
	const merge1 = geo1.createNode('merge');
	const lightMixer1 = geo1.createNode('lightMixer');

	merge1.p.inputsCount.set(6);
	merge1.setInput(0, ambientLight1);
	merge1.setInput(1, areaLight1);
	merge1.setInput(2, directionalLight1);
	merge1.setInput(3, hemisphereLight1);
	merge1.setInput(4, pointLight1);
	merge1.setInput(5, spotLight1);

	lightMixer1.setInput(0, merge1);

	await merge1.compute();
	assert.equal(lightMixer1.params.spare.length, 0);
	await lightMixer1.p.setup.pressButton();
	assert.equal(lightMixer1.params.spare.length, 30);

	let container = await lightMixer1.compute();
	assert.equal(getLight(container, 'ambientLight1')?.intensity, 1);

	lightMixer1.params.get('ambientLight1_int')!.set(0.5);
	container = await lightMixer1.compute();
	assert.equal(getLight(container, 'ambientLight1')?.intensity, 0.5);

	lightMixer1.params.get('spotLight1_int')!.set(1.2);
	container = await lightMixer1.compute();
	assert.equal(getLight(container, 'spotLight1')?.intensity, 1.2);

	lightMixer1.params.get('areaLight1_col')!.set([0, 0.2, 0.4]);
	container = await lightMixer1.compute();
	assert.deepEqual(getLight(container, 'areaLight1')?.color.toArray(), [0, 0.2, 0.4]);
});

}