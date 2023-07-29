import type {QUnit} from '../../../helpers/QUnit';
import {SpotLight} from 'three';
import {CoreGroup} from '../../../../src/core/geometry/Group';
import {LightUserDataRaymarching} from '../../../../src/core/lights/Common';
export function testenginenodesjsOutputSpotLight(qUnit: QUnit) {

function isSpotLight(object: any): object is SpotLight {
	return (object as SpotLight).isSpotLight == true && (object as SpotLight).intensity != null;
}

function getLight(coreGroup: CoreGroup): SpotLight {
	const objects = coreGroup.threejsObjects();
	for (let object of objects) {
		if (isSpotLight(object)) {
			return object;
		}
	}
	let light: SpotLight | undefined;
	for (let object of objects) {
		object.traverse((child) => {
			if (light == null && isSpotLight(child)) {
				light = child;
			}
		});
	}
	return light!;
}

qUnit.test('js/OutputSpotLight simple', async (assert) => {
	const geo1 = window.geo1;
	const spotLight1 = geo1.createNode('spotLight');
	const objectBuilder1 = geo1.createNode('objectBuilder');
	objectBuilder1.setInput(0, spotLight1);

	spotLight1.p.showHelper.set(1);
	spotLight1.p.raymarchingPenumbra.set(0.03);
	objectBuilder1.p.applyToChildren.set(1);

	spotLight1.p.intensity.set(2);
	spotLight1.p.color.set([1, 0.5, 0.25]);
	spotLight1.p.distance.set(3);
	spotLight1.p.shadowBias.set(5);
	spotLight1.p.shadowRadius.set(5);
	spotLight1.p.angle.set(0.1);
	spotLight1.p.penumbra.set(0.15);
	spotLight1.p.decay.set(0.23);

	//
	const output1 = objectBuilder1.createNode('output');
	const globals1 = objectBuilder1.createNode('globals');
	output1.setInput('position', globals1);

	//
	const outputLight1 = objectBuilder1.createNode('outputSpotLight');
	const globalsLight1 = objectBuilder1.createNode('globalsSpotLight');
	const multAdd1 = objectBuilder1.createNode('multAdd');
	const multAdd2 = objectBuilder1.createNode('multAdd');
	const multAdd3 = objectBuilder1.createNode('multAdd');
	const multAdd4 = objectBuilder1.createNode('multAdd');
	const multAdd5 = objectBuilder1.createNode('multAdd');
	const multAdd6 = objectBuilder1.createNode('multAdd');
	const multAdd7 = objectBuilder1.createNode('multAdd');
	const multAdd8 = objectBuilder1.createNode('multAdd');
	const multAdd9 = objectBuilder1.createNode('multAdd');
	const multAdd10 = objectBuilder1.createNode('multAdd');
	const multAdd11 = objectBuilder1.createNode('multAdd');
	multAdd1.setInput(0, globalsLight1, 'intensity');
	multAdd2.setInput(0, globalsLight1, 'color');
	multAdd3.setInput(0, globalsLight1, 'angle');
	multAdd4.setInput(0, globalsLight1, 'penumbra');
	multAdd5.setInput(0, globalsLight1, 'decay');
	multAdd6.setInput(0, globalsLight1, 'distance');
	multAdd7.setInput(0, globalsLight1, 'shadowBias');
	multAdd8.setInput(0, globalsLight1, 'shadowRadius');
	multAdd9.setInput(0, globalsLight1, LightUserDataRaymarching.PENUMBRA);
	multAdd10.setInput(0, globalsLight1, LightUserDataRaymarching.SHADOW_BIAS_ANGLE);
	multAdd11.setInput(0, globalsLight1, LightUserDataRaymarching.SHADOW_BIAS_DISTANCE);
	outputLight1.setInput('intensity', multAdd1);
	outputLight1.setInput('color', multAdd2);
	outputLight1.setInput('angle', multAdd3);
	outputLight1.setInput('penumbra', multAdd4);
	outputLight1.setInput('decay', multAdd5);
	outputLight1.setInput('distance', multAdd6);
	outputLight1.setInput('shadowBias', multAdd7);
	outputLight1.setInput('shadowRadius', multAdd8);
	outputLight1.setInput(LightUserDataRaymarching.PENUMBRA, multAdd9);
	outputLight1.setInput(LightUserDataRaymarching.SHADOW_BIAS_ANGLE, multAdd10);
	outputLight1.setInput(LightUserDataRaymarching.SHADOW_BIAS_DISTANCE, multAdd11);

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
	async function getAngle() {
		const container = await objectBuilder1.compute();
		const light = getLight(container.coreContent()!);
		return light.angle;
	}
	async function getPenumbra() {
		const container = await objectBuilder1.compute();
		const light = getLight(container.coreContent()!);
		return light.penumbra;
	}
	async function getDecay() {
		const container = await objectBuilder1.compute();
		const light = getLight(container.coreContent()!);
		return light.decay;
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
	async function getShadowRadius() {
		const container = await objectBuilder1.compute();
		const light = getLight(container.coreContent()!);
		return light.shadow.radius;
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
	assert.in_delta(await getAngle(), 0.0017, 0.0002, 'getAngle');
	assert.equal(await getPenumbra(), 0.15, 'getPenumbra');
	assert.equal(await getDecay(), 0.23, 'getDecay');
	assert.equal(await getDistance(), 3, 'getDistance');
	assert.equal(await getShadowBias(), 5, 'getShadowBias');
	assert.equal(await getShadowRadius(), 5, 'getShadowRadius');
	assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

	// with mult 1
	multAdd1.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 1)');
	assert.deepEqual(await getColor(), [1, 0.5, 0.25]);
	assert.in_delta(await getAngle(), 0.0017, 0.0002, 'getAngle');
	assert.equal(await getPenumbra(), 0.15, 'getPenumbra');
	assert.equal(await getDecay(), 0.23, 'getDecay');
	assert.equal(await getDistance(), 3, 'getDistance');
	assert.equal(await getShadowBias(), 5, 'getShadowBias');
	assert.equal(await getShadowRadius(), 5, 'getShadowRadius');
	assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

	// with mult 2
	multAdd2.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 1)');
	assert.deepEqual(await getColor(), [2, 1, 0.5]);
	assert.in_delta(await getAngle(), 0.0017, 0.0002, 'getAngle');
	assert.equal(await getPenumbra(), 0.15, 'getPenumbra');
	assert.equal(await getDecay(), 0.23, 'getDecay');
	assert.equal(await getDistance(), 3, 'getDistance');
	assert.equal(await getShadowBias(), 5, 'getShadowBias');
	assert.equal(await getShadowRadius(), 5, 'getShadowRadius');
	assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

	// with mult 3
	multAdd3.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 2)');
	assert.deepEqual(await getColor(), [2, 1, 0.5]);
	assert.in_delta(await getAngle(), 0.0034, 0.0002, 'getAngle');
	assert.equal(await getPenumbra(), 0.15, 'getPenumbra');
	assert.equal(await getDecay(), 0.23, 'getDecay');
	assert.equal(await getDistance(), 3, 'getDistance');
	assert.equal(await getShadowBias(), 5, 'getShadowBias');
	assert.equal(await getShadowRadius(), 5, 'getShadowRadius');
	assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

	// with mult 4
	multAdd4.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 2)');
	assert.deepEqual(await getColor(), [2, 1, 0.5]);
	assert.in_delta(await getAngle(), 0.0034, 0.0002, 'getAngle');
	assert.equal(await getPenumbra(), 0.3, 'getPenumbra');
	assert.equal(await getDecay(), 0.23, 'getDecay');
	assert.equal(await getDistance(), 3, 'getDistance');
	assert.equal(await getShadowBias(), 5, 'getShadowBias');
	assert.equal(await getShadowRadius(), 5, 'getShadowRadius');
	assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

	// with mult 5
	multAdd5.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 2)');
	assert.deepEqual(await getColor(), [2, 1, 0.5]);
	assert.in_delta(await getAngle(), 0.0034, 0.0002, 'getAngle');
	assert.equal(await getPenumbra(), 0.3, 'getPenumbra');
	assert.equal(await getDecay(), 0.46, 'getDecay');
	assert.equal(await getDistance(), 3, 'getDistance');
	assert.equal(await getShadowBias(), 5, 'getShadowBias');
	assert.equal(await getShadowRadius(), 5, 'getShadowRadius');
	assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

	// with mult 6
	multAdd6.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 2)');
	assert.deepEqual(await getColor(), [2, 1, 0.5]);
	assert.in_delta(await getAngle(), 0.0034, 0.0002, 'getAngle');
	assert.equal(await getPenumbra(), 0.3, 'getPenumbra');
	assert.equal(await getDecay(), 0.46, 'getDecay');
	assert.equal(await getDistance(), 6, 'getDistance');
	assert.equal(await getShadowBias(), 5, 'getShadowBias');
	assert.equal(await getShadowRadius(), 5, 'getShadowRadius');
	assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

	// with mult 7
	multAdd7.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 2)');
	assert.deepEqual(await getColor(), [2, 1, 0.5]);
	assert.in_delta(await getAngle(), 0.0034, 0.0002, 'getAngle');
	assert.equal(await getPenumbra(), 0.3, 'getPenumbra');
	assert.equal(await getDecay(), 0.46, 'getDecay');
	assert.equal(await getDistance(), 6, 'getDistance');
	assert.equal(await getShadowBias(), 10, 'getShadowBias');
	assert.equal(await getShadowRadius(), 5, 'getShadowRadius');
	assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

	// with mult 8
	multAdd8.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 2)');
	assert.deepEqual(await getColor(), [2, 1, 0.5]);
	assert.in_delta(await getAngle(), 0.0034, 0.0002, 'getAngle');
	assert.equal(await getPenumbra(), 0.3, 'getPenumbra');
	assert.equal(await getDecay(), 0.46, 'getDecay');
	assert.equal(await getDistance(), 6, 'getDistance');
	assert.equal(await getShadowBias(), 10, 'getShadowBias');
	assert.equal(await getShadowRadius(), 10, 'getShadowRadius');
	assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

	// with mult 9
	multAdd9.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 2)');
	assert.deepEqual(await getColor(), [2, 1, 0.5]);
	assert.in_delta(await getAngle(), 0.0034, 0.0002, 'getAngle');
	assert.equal(await getPenumbra(), 0.3, 'getPenumbra');
	assert.equal(await getDecay(), 0.46, 'getDecay');
	assert.equal(await getDistance(), 6, 'getDistance');
	assert.equal(await getShadowBias(), 10, 'getShadowBias');
	assert.equal(await getShadowRadius(), 10, 'getShadowRadius');
	assert.equal(await getRaymarchingPenumbra(), 0.06, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

	// with mult 10
	multAdd10.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 2)');
	assert.deepEqual(await getColor(), [2, 1, 0.5]);
	assert.in_delta(await getAngle(), 0.0034, 0.0002, 'getAngle');
	assert.equal(await getPenumbra(), 0.3, 'getPenumbra');
	assert.equal(await getDecay(), 0.46, 'getDecay');
	assert.equal(await getDistance(), 6, 'getDistance');
	assert.equal(await getShadowBias(), 10, 'getShadowBias');
	assert.equal(await getShadowRadius(), 10, 'getShadowRadius');
	assert.equal(await getRaymarchingPenumbra(), 0.06, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.02, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

	// with mult 11
	multAdd11.params.get('mult')!.set(2);
	assert.equal(await getIntensity(), 4, 'intensity (mult 2)');
	assert.deepEqual(await getColor(), [2, 1, 0.5]);
	assert.in_delta(await getAngle(), 0.0034, 0.0002, 'getAngle');
	assert.equal(await getPenumbra(), 0.3, 'getPenumbra');
	assert.equal(await getDecay(), 0.46, 'getDecay');
	assert.equal(await getDistance(), 6, 'getDistance');
	assert.equal(await getShadowBias(), 10, 'getShadowBias');
	assert.equal(await getShadowRadius(), 10, 'getShadowRadius');
	assert.equal(await getRaymarchingPenumbra(), 0.06, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.02, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.2, 'getRaymarchingShadowBiasDistance');

	// without applyToChildren
	objectBuilder1.p.applyToChildren.set(0);
	assert.equal(await getIntensity(), 2, 'intensity (no applyToChildren)');
	assert.deepEqual(await getColor(), [1, 0.5, 0.25]);
	assert.in_delta(await getAngle(), 0.0017, 0.0002, 'getAngle');
	assert.equal(await getPenumbra(), 0.15, 'getPenumbra');
	assert.equal(await getDecay(), 0.23, 'getDecay');
	assert.equal(await getDistance(), 3, 'getDistance');
	assert.equal(await getShadowBias(), 5, 'getShadowBias');
	assert.equal(await getShadowRadius(), 5, 'getShadowRadius');
	assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

	// without helper (there is still a hierarchy, as the light has a target)
	spotLight1.p.showHelper.set(0);
	assert.equal(await getIntensity(), 2, 'intensity (no showHelper)');
	assert.deepEqual(await getColor(), [1, 0.5, 0.25]);
	assert.in_delta(await getAngle(), 0.0017, 0.0002, 'getAngle');
	assert.equal(await getPenumbra(), 0.15, 'getPenumbra');
	assert.equal(await getDecay(), 0.23, 'getDecay');
	assert.equal(await getDistance(), 3, 'getDistance');
	assert.equal(await getShadowBias(), 5, 'getShadowBias');
	assert.equal(await getShadowRadius(), 5, 'getShadowRadius');
	assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

	// set the group instead of the applyToChildren
	objectBuilder1.p.group.set('*/spotLight*');
	assert.equal(await getIntensity(), 4, 'intensity (with group)');
	assert.deepEqual(await getColor(), [2, 1, 0.5]);
	assert.in_delta(await getAngle(), 0.0034, 0.0002, 'getAngle');
	assert.equal(await getPenumbra(), 0.3, 'getPenumbra');
	assert.equal(await getDecay(), 0.46, 'getDecay');
	assert.equal(await getDistance(), 6, 'getDistance');
	assert.equal(await getShadowBias(), 10, 'getShadowBias');
	assert.equal(await getShadowRadius(), 10, 'getShadowRadius');
	assert.equal(await getRaymarchingPenumbra(), 0.06, 'getRaymarchingPenumbra');
	assert.equal(await getRaymarchingShadowBiasAngle(), 0.02, 'getRaymarchingShadowBiasAngle');
	assert.equal(await getRaymarchingShadowBiasDistance(), 0.2, 'getRaymarchingShadowBiasDistance');
});

}