import type {QUnit} from '../../../helpers/QUnit';
import {HemisphereLight} from 'three';
import {CoreGroup} from '../../../../src/core/geometry/Group';
export function testenginenodesjsOutputHemisphereLight(qUnit: QUnit) {

function isAreaLight(object: any): object is HemisphereLight {
	return (
		(object as HemisphereLight).isHemisphereLight == true &&
		(object as HemisphereLight).intensity != null &&
		(object as HemisphereLight).color != null
	);
}

function getLight(coreGroup: CoreGroup): HemisphereLight {
	const objects = coreGroup.threejsObjects();
	for (let object of objects) {
		if (isAreaLight(object)) {
			return object;
		}
	}
	let light: HemisphereLight | undefined;
	for (let object of objects) {
		object.traverse((child) => {
			if (light == null && isAreaLight(child)) {
				light = child;
			}
		});
	}
	return light!;
}

qUnit.test('js/OutputHemisphereLight simple', async (assert) => {
	const geo1 = window.geo1;
	const hemisphereLight1 = geo1.createNode('hemisphereLight');
	const objectBuilder1 = geo1.createNode('objectBuilder');
	objectBuilder1.setInput(0, hemisphereLight1);

	objectBuilder1.p.applyToChildren.set(1);

	hemisphereLight1.p.intensity.set(2);
	hemisphereLight1.p.skyColor.set([1, 0.5, 0.25]);
	hemisphereLight1.p.groundColor.set([0.2, 0.4, 0.8]);

	//
	const output1 = objectBuilder1.createNode('output');
	const globals1 = objectBuilder1.createNode('globals');
	output1.setInput('position', globals1);

	//
	const outputHemisphereLight1 = objectBuilder1.createNode('outputHemisphereLight');
	const globalsHemisphereLight1 = objectBuilder1.createNode('globalsHemisphereLight');
	const multAdd1 = objectBuilder1.createNode('multAdd');
	const multAdd2 = objectBuilder1.createNode('multAdd');
	const multAdd3 = objectBuilder1.createNode('multAdd');
	multAdd1.setInput(0, globalsHemisphereLight1, 'intensity');
	multAdd2.setInput(0, globalsHemisphereLight1, 'skyColor');
	multAdd3.setInput(0, globalsHemisphereLight1, 'groundColor');
	outputHemisphereLight1.setInput('intensity', multAdd1);
	outputHemisphereLight1.setInput('skyColor', multAdd2);
	outputHemisphereLight1.setInput('groundColor', multAdd3);

	async function getIntensity() {
		const container = await objectBuilder1.compute();
		const light = getLight(container.coreContent()!);
		return light.intensity;
	}
	async function getSkyColor() {
		const container = await objectBuilder1.compute();
		const light = getLight(container.coreContent()!);
		return light.color.toArray();
	}
	async function getGroundColor() {
		const container = await objectBuilder1.compute();
		const light = getLight(container.coreContent()!);
		return light.groundColor.toArray();
	}

	await objectBuilder1.compute();
	assert.notOk(objectBuilder1.states.error.active());
	assert.notOk(objectBuilder1.states.error.message());

	// no mult
	assert.equal(await getIntensity(), 2, 'intensity (no mult)');
	assert.deepEqual(await getSkyColor(), [1, 0.5, 0.25]);
	assert.deepEqual(await getGroundColor(), [0.2, 0.4, 0.8]);

	// with mult 1
	multAdd1.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 1)');
	assert.deepEqual(await getSkyColor(), [1, 0.5, 0.25]);
	assert.deepEqual(await getGroundColor(), [0.2, 0.4, 0.8]);

	// with mult 2
	multAdd2.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 2)');
	assert.deepEqual(await getSkyColor(), [2, 1, 0.5]);
	assert.deepEqual(await getGroundColor(), [0.2, 0.4, 0.8]);

	// with mult 3
	multAdd3.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 3)');
	assert.deepEqual(await getSkyColor(), [2, 1, 0.5]);
	assert.deepEqual(await getGroundColor(), [0.4, 0.8, 1.6]);

	// without applyToChildren
	objectBuilder1.p.applyToChildren.set(0);
	assert.equal(await getIntensity(), 4, 'intensity (no applyToChildren)');
	assert.deepEqual(await getSkyColor(), [2, 1, 0.5]);
	assert.deepEqual(await getGroundColor(), [0.4, 0.8, 1.6]);
});

}