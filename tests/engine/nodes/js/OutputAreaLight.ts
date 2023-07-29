import type {QUnit} from '../../../helpers/QUnit';
import {RectAreaLight} from 'three';
import {CoreGroup} from '../../../../src/core/geometry/Group';
export function testenginenodesjsOutputAreaLight(qUnit: QUnit) {

function isAreaLight(object: any): object is RectAreaLight {
	return (
		(object as RectAreaLight).isRectAreaLight == true &&
		(object as RectAreaLight).intensity != null &&
		(object as RectAreaLight).width != null &&
		(object as RectAreaLight).height != null
	);
}

function getLight(coreGroup: CoreGroup): RectAreaLight {
	const objects = coreGroup.threejsObjects();
	for (let object of objects) {
		if (isAreaLight(object)) {
			return object;
		}
	}
	let light: RectAreaLight | undefined;
	for (let object of objects) {
		object.traverse((child) => {
			if (light == null && isAreaLight(child)) {
				light = child;
			}
		});
	}
	return light!;
}

qUnit.test('js/OutputAreaLight simple', async (assert) => {
	const geo1 = window.geo1;
	const areaLight1 = geo1.createNode('areaLight');
	const objectBuilder1 = geo1.createNode('objectBuilder');
	objectBuilder1.setInput(0, areaLight1);

	areaLight1.p.showHelper.set(1);
	objectBuilder1.p.applyToChildren.set(1);

	areaLight1.p.intensity.set(2);
	areaLight1.p.color.set([1, 0.5, 0.25]);
	areaLight1.p.width.set(3);
	areaLight1.p.height.set(5);

	//
	const output1 = objectBuilder1.createNode('output');
	const globals1 = objectBuilder1.createNode('globals');
	output1.setInput('position', globals1);

	//
	const outputAreaLight1 = objectBuilder1.createNode('outputAreaLight');
	const globalsAreaLight1 = objectBuilder1.createNode('globalsAreaLight');
	const multAdd1 = objectBuilder1.createNode('multAdd');
	const multAdd2 = objectBuilder1.createNode('multAdd');
	const multAdd3 = objectBuilder1.createNode('multAdd');
	const multAdd4 = objectBuilder1.createNode('multAdd');
	multAdd1.setInput(0, globalsAreaLight1, 'intensity');
	multAdd2.setInput(0, globalsAreaLight1, 'color');
	multAdd3.setInput(0, globalsAreaLight1, 'width');
	multAdd4.setInput(0, globalsAreaLight1, 'height');
	outputAreaLight1.setInput('intensity', multAdd1);
	outputAreaLight1.setInput('color', multAdd2);
	outputAreaLight1.setInput('width', multAdd3);
	outputAreaLight1.setInput('height', multAdd4);

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
	async function getWidth() {
		const container = await objectBuilder1.compute();
		const light = getLight(container.coreContent()!);
		return light.width;
	}
	async function getHeight() {
		const container = await objectBuilder1.compute();
		const light = getLight(container.coreContent()!);
		return light.height;
	}

	await objectBuilder1.compute();
	assert.notOk(objectBuilder1.states.error.active());
	assert.notOk(objectBuilder1.states.error.message());

	// no mult
	assert.equal(await getIntensity(), 2, 'intensity (no mult)');
	assert.deepEqual(await getColor(), [1, 0.5, 0.25]);
	assert.equal(await getWidth(), 3);
	assert.equal(await getHeight(), 5);

	// with mult 1
	multAdd1.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 1)');
	assert.deepEqual(await getColor(), [1, 0.5, 0.25]);
	assert.equal(await getWidth(), 3);
	assert.equal(await getHeight(), 5);

	// with mult 2
	multAdd2.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 2)');
	assert.deepEqual(await getColor(), [2, 1, 0.5]);
	assert.equal(await getWidth(), 3);
	assert.equal(await getHeight(), 5);

	// with mult 3
	multAdd3.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 3)');
	assert.deepEqual(await getColor(), [2, 1, 0.5]);
	assert.equal(await getWidth(), 6);
	assert.equal(await getHeight(), 5);

	// with mult 4
	multAdd4.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 3)');
	assert.deepEqual(await getColor(), [2, 1, 0.5]);
	assert.equal(await getWidth(), 6);
	assert.equal(await getHeight(), 10);

	// without applyToChildren
	objectBuilder1.p.applyToChildren.set(0);
	assert.equal(await getIntensity(), 2, 'intensity (without applyToChildren)');
	assert.deepEqual(await getColor(), [1, 0.5, 0.25]);
	assert.equal(await getWidth(), 3);
	assert.equal(await getHeight(), 5);
	assert.notOk(objectBuilder1.states.error.message());

	// without helper
	areaLight1.p.showHelper.set(0);
	assert.equal(await getIntensity(), 4, 'intensity (without helper)');
	assert.deepEqual(await getColor(), [2, 1, 0.5]);
	assert.equal(await getWidth(), 6);
	assert.equal(await getHeight(), 10);
});

}