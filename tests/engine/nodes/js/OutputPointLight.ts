import {PointLight} from 'three';
import {CoreGroup} from '../../../../src/core/geometry/Group';
import {LightUserDataRaymarching} from '../../../../src/core/lights/Common';

function isPointLight(object: any): object is PointLight {
	return (object as any).isPointLight == true && (object as PointLight).intensity != null;
}

function getLight(coreGroup: CoreGroup): PointLight {
	const objects = coreGroup.threejsObjects();
	for (let object of objects) {
		if (isPointLight(object)) {
			return object;
		}
	}
	let light: PointLight | undefined;
	for (let object of objects) {
		object.traverse((child) => {
			if (light == null && isPointLight(child)) {
				light = child;
			}
		});
	}
	return light!;
}

QUnit.test('js/OutputPointLight simple', async (assert) => {
	const geo1 = window.geo1;
	const pointLight1 = geo1.createNode('pointLight');
	const objectBuilder1 = geo1.createNode('objectBuilder');
	objectBuilder1.setInput(0, pointLight1);

	pointLight1.p.showHelper.set(1);
	pointLight1.p.raymarchingPenumbra.set(0.03);
	objectBuilder1.p.applyToChildren.set(1);

	pointLight1.p.intensity.set(2);
	pointLight1.p.color.set([1, 0.5, 0.25]);
	pointLight1.p.distance.set(3);
	pointLight1.p.shadowBias.set(5);
	pointLight1.p.decay.set(0.1);

	//
	const output1 = objectBuilder1.createNode('output');
	const globals1 = objectBuilder1.createNode('globals');
	output1.setInput('position', globals1);

	//
	const outputDirectionalLight1 = objectBuilder1.createNode('outputPointLight');
	const globalsDirectionalLight1 = objectBuilder1.createNode('globalsPointLight');
	const multAdd1 = objectBuilder1.createNode('multAdd');
	const multAdd2 = objectBuilder1.createNode('multAdd');
	const multAdd3 = objectBuilder1.createNode('multAdd');
	const multAdd4 = objectBuilder1.createNode('multAdd');
	const multAdd5 = objectBuilder1.createNode('multAdd');
	const multAdd6 = objectBuilder1.createNode('multAdd');
	const multAdd7 = objectBuilder1.createNode('multAdd');
	const multAdd8 = objectBuilder1.createNode('multAdd');
	multAdd1.setInput(0, globalsDirectionalLight1, 'intensity');
	multAdd2.setInput(0, globalsDirectionalLight1, 'color');
	multAdd3.setInput(0, globalsDirectionalLight1, 'distance');
	multAdd4.setInput(0, globalsDirectionalLight1, 'shadowBias');
	multAdd5.setInput(0, globalsDirectionalLight1, 'decay');
	multAdd6.setInput(0, globalsDirectionalLight1, LightUserDataRaymarching.PENUMBRA);
	multAdd7.setInput(0, globalsDirectionalLight1, LightUserDataRaymarching.SHADOW_BIAS_ANGLE);
	multAdd8.setInput(0, globalsDirectionalLight1, LightUserDataRaymarching.SHADOW_BIAS_DISTANCE);
	outputDirectionalLight1.setInput('intensity', multAdd1);
	outputDirectionalLight1.setInput('color', multAdd2);
	outputDirectionalLight1.setInput('distance', multAdd3);
	outputDirectionalLight1.setInput('shadowBias', multAdd4);
	outputDirectionalLight1.setInput('decay', multAdd5);
	outputDirectionalLight1.setInput(LightUserDataRaymarching.PENUMBRA, multAdd6);
	outputDirectionalLight1.setInput(LightUserDataRaymarching.SHADOW_BIAS_ANGLE, multAdd7);
	outputDirectionalLight1.setInput(LightUserDataRaymarching.SHADOW_BIAS_DISTANCE, multAdd8);

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
	async function getDistance() {
		const container = await objectBuilder1.compute();
		const light = getLight(container.coreContent()!);
		return light.distance;
	}
	async function getShadowBias() {
		const container = await objectBuilder1.compute();
		const light = getLight(container.coreContent()!);
		return light.shadow.bias;
	}
	async function getDecay() {
		const container = await objectBuilder1.compute();
		const light = getLight(container.coreContent()!);
		return light.decay;
	}
	async function getRaymarchingPenumbra() {
		const container = await objectBuilder1.compute();
		const light = getLight(container.coreContent()!);
		return light.userData[LightUserDataRaymarching.PENUMBRA];
	}
	async function getRaymarchingShadowBiasAngle() {
		const container = await objectBuilder1.compute();
		const light = getLight(container.coreContent()!);
		return light.userData[LightUserDataRaymarching.SHADOW_BIAS_ANGLE];
	}
	async function getRaymarchingShadowBiasDistance() {
		const container = await objectBuilder1.compute();
		const light = getLight(container.coreContent()!);
		return light.userData[LightUserDataRaymarching.SHADOW_BIAS_DISTANCE];
	}

	await objectBuilder1.compute();
	assert.notOk(objectBuilder1.states.error.active());
	assert.notOk(objectBuilder1.states.error.message());

	// no mult
	assert.equal(await getIntensity(), 2, 'intensity (no mult)');
	assert.deepEqual(await getColor(), [1, 0.5, 0.25]);
	assert.equal(await getDistance(), 3);
	assert.equal(await getShadowBias(), 5);
	assert.equal(await getDecay(), 0.1, 'getDecay');
	assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

	// with mult 1
	multAdd1.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 1)');
	assert.deepEqual(await getColor(), [1, 0.5, 0.25]);
	assert.equal(await getDistance(), 3);
	assert.equal(await getShadowBias(), 5);
	assert.equal(await getDecay(), 0.1, 'getDecay');
	assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

	// with mult 2
	multAdd2.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 2)');
	assert.deepEqual(await getColor(), [2, 1, 0.5]);
	assert.equal(await getDistance(), 3);
	assert.equal(await getShadowBias(), 5);
	assert.equal(await getDecay(), 0.1, 'getDecay');
	assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

	// with mult 3
	multAdd3.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 3)');
	assert.deepEqual(await getColor(), [2, 1, 0.5]);
	assert.equal(await getDistance(), 6);
	assert.equal(await getShadowBias(), 5);
	assert.equal(await getDecay(), 0.1, 'getDecay');
	assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

	// with mult 4
	multAdd4.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 4)');
	assert.deepEqual(await getColor(), [2, 1, 0.5]);
	assert.equal(await getDistance(), 6);
	assert.equal(await getShadowBias(), 10);
	assert.equal(await getDecay(), 0.1, 'getDecay');
	assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

	// with mult 5
	multAdd5.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 5)');
	assert.deepEqual(await getColor(), [2, 1, 0.5]);
	assert.equal(await getDistance(), 6);
	assert.equal(await getShadowBias(), 10);
	assert.equal(await getDecay(), 0.2, 'getDecay');
	assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

	// with mult 6
	multAdd6.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 6)');
	assert.deepEqual(await getColor(), [2, 1, 0.5]);
	assert.equal(await getDistance(), 6);
	assert.equal(await getShadowBias(), 10);
	assert.equal(await getDecay(), 0.2, 'getDecay');
	assert.equal(await getRaymarchingPenumbra(), 0.06, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

	// with mult 7
	multAdd7.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 7)');
	assert.deepEqual(await getColor(), [2, 1, 0.5]);
	assert.equal(await getDistance(), 6);
	assert.equal(await getShadowBias(), 10);
	assert.equal(await getDecay(), 0.2, 'getDecay');
	assert.equal(await getRaymarchingPenumbra(), 0.06, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.02, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

	// with mult 8
	multAdd8.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 8)');
	assert.deepEqual(await getColor(), [2, 1, 0.5]);
	assert.equal(await getDistance(), 6);
	assert.equal(await getShadowBias(), 10);
	assert.equal(await getDecay(), 0.2, 'getDecay');
	assert.equal(await getRaymarchingPenumbra(), 0.06, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.02, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.2, 'getRaymarchingShadowBiasDistance');

	// without applyToChildren
	objectBuilder1.p.applyToChildren.set(0);
	assert.equal(await getIntensity(), 2, 'intensity (no applyToChildren)');
	assert.deepEqual(await getColor(), [1, 0.5, 0.25]);
	assert.equal(await getDistance(), 3);
	assert.equal(await getShadowBias(), 5);
	assert.equal(await getDecay(), 0.1, 'getDecay');
	assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

	// without helper
	pointLight1.p.showHelper.set(0);
	assert.equal(await getIntensity(), 4, 'intensity (mult 8)');
	assert.deepEqual(await getColor(), [2, 1, 0.5]);
	assert.equal(await getDistance(), 6);
	assert.equal(await getShadowBias(), 10);
	assert.equal(await getDecay(), 0.2, 'getDecay');
	assert.equal(await getRaymarchingPenumbra(), 0.06, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.02, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.2, 'getRaymarchingShadowBiasDistance');
});
