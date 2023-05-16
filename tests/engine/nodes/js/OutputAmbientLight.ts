import {AmbientLight} from 'three';
import {CoreGroup} from '../../../../src/core/geometry/Group';

function getLight(coreGroup: CoreGroup): AmbientLight {
	const objects = coreGroup.threejsObjects();
	for (let object of objects) {
		if (object instanceof AmbientLight) {
			return object;
		}
	}
	let light: AmbientLight | undefined;
	for (let object of objects) {
		object.traverse((child) => {
			if (light == null && child instanceof AmbientLight) {
				light = child;
			}
		});
	}
	return light!;
}

QUnit.test('js/OutputAmbientLight simple', async (assert) => {
	const geo1 = window.geo1;
	const ambientLight1 = geo1.createNode('ambientLight');
	const objectBuilder1 = geo1.createNode('objectBuilder');
	objectBuilder1.setInput(0, ambientLight1);

	ambientLight1.p.intensity.set(2);
	ambientLight1.p.color.set([1, 0.5, 0.25]);

	//
	const output1 = objectBuilder1.createNode('output');
	const globals1 = objectBuilder1.createNode('globals');
	output1.setInput('position', globals1);

	//
	const outputAmbientLight1 = objectBuilder1.createNode('outputAmbientLight');
	const globalsAmbientLight1 = objectBuilder1.createNode('globalsAmbientLight');
	const multAdd1 = objectBuilder1.createNode('multAdd');
	const multAdd2 = objectBuilder1.createNode('multAdd');
	multAdd1.setInput(0, globalsAmbientLight1, 'intensity');
	multAdd2.setInput(0, globalsAmbientLight1, 'color');
	outputAmbientLight1.setInput('intensity', multAdd1);
	outputAmbientLight1.setInput('color', multAdd2);

	async function getIntensity() {
		const container = await objectBuilder1.compute();
		const light = getLight(container.coreContent()!);
		return light.intensity;
	}
	async function getColor() {
		const container = await objectBuilder1.compute();
		const light = getLight(container.coreContent()!);
		return light.color.toArray();
	}

	await objectBuilder1.compute();
	assert.notOk(objectBuilder1.states.error.active());
	assert.notOk(objectBuilder1.states.error.message());

	// no mult
	assert.equal(await getIntensity(), 2);
	assert.deepEqual(await getColor(), [1, 0.5, 0.25]);

	// with mult 1
	multAdd1.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4);
	assert.deepEqual(await getColor(), [1, 0.5, 0.25]);

	// with mult 2
	multAdd2.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4);
	assert.deepEqual(await getColor(), [2, 1, 0.5]);
});
