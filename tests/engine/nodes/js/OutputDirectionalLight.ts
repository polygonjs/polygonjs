import type {QUnit} from '../../../helpers/QUnit';
import {DirectionalLight} from 'three';
import {CoreGroup} from '../../../../src/core/geometry/Group';
import {LightUserDataRaymarching} from '../../../../src/core/lights/Common';
export function testenginenodesjsOutputDirectionalLight(qUnit: QUnit) {
	function isDirectionalLight(object: any): object is DirectionalLight {
		return (
			(object as DirectionalLight).isDirectionalLight == true && (object as DirectionalLight).intensity != null
		);
	}

	function getLight(coreGroup: CoreGroup): DirectionalLight {
		const objects = coreGroup.threejsObjects();
		for (let object of objects) {
			if (isDirectionalLight(object)) {
				return object;
			}
		}
		let light: DirectionalLight | undefined;
		for (let object of objects) {
			object.traverse((child) => {
				if (light == null && isDirectionalLight(child)) {
					light = child;
				}
			});
		}
		return light!;
	}

	qUnit.test('js/OutputDirectionalLight simple', async (assert) => {
		const geo1 = window.geo1;
		const directionalLight1 = geo1.createNode('directionalLight');
		const objectBuilder1 = geo1.createNode('objectBuilder');
		objectBuilder1.setInput(0, directionalLight1);

		directionalLight1.p.showHelper.set(1);
		directionalLight1.p.raymarchingPenumbra.set(0.03);
		objectBuilder1.p.group.set('*');

		directionalLight1.p.intensity.set(2);
		directionalLight1.p.color.set([1, 0.5, 0.25]);
		directionalLight1.p.distance.set(3);
		directionalLight1.p.shadowBias.set(5);
		directionalLight1.p.shadowRadius.set(5);

		//
		const output1 = objectBuilder1.createNode('output');
		const globals1 = objectBuilder1.createNode('globals');
		output1.setInput('position', globals1);

		//
		const outputDirectionalLight1 = objectBuilder1.createNode('outputDirectionalLight');
		const globalsDirectionalLight1 = objectBuilder1.createNode('globalsDirectionalLight');
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
		multAdd5.setInput(0, globalsDirectionalLight1, 'shadowRadius');
		multAdd6.setInput(0, globalsDirectionalLight1, LightUserDataRaymarching.PENUMBRA);
		multAdd7.setInput(0, globalsDirectionalLight1, LightUserDataRaymarching.SHADOW_BIAS_ANGLE);
		multAdd8.setInput(0, globalsDirectionalLight1, LightUserDataRaymarching.SHADOW_BIAS_DISTANCE);
		outputDirectionalLight1.setInput('intensity', multAdd1);
		outputDirectionalLight1.setInput('color', multAdd2);
		outputDirectionalLight1.setInput('distance', multAdd3);
		outputDirectionalLight1.setInput('shadowBias', multAdd4);
		outputDirectionalLight1.setInput('shadowRadius', multAdd5);
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
			return light.shadow.camera.far;
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
		assert.equal(await getDistance(), 3);
		assert.equal(await getShadowBias(), 5);
		assert.equal(await getShadowRadius(), 5, 'getShadowRadius');
		assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
		assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
		assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

		// with mult 1
		multAdd1.params.get('mult')!.set(2);
		assert.equal(await getIntensity(), 4, 'intensity (mult 1)');
		assert.deepEqual(await getColor(), [1, 0.5, 0.25]);
		assert.equal(await getDistance(), 3);
		assert.equal(await getShadowBias(), 5);
		assert.equal(await getShadowRadius(), 5, 'getShadowRadius');
		assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
		assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
		assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

		// with mult 2
		multAdd2.params.get('mult')!.set(2);
		assert.equal(await getIntensity(), 4, 'intensity (mult 2)');
		assert.deepEqual(await getColor(), [2, 1, 0.5]);
		assert.equal(await getDistance(), 3);
		assert.equal(await getShadowBias(), 5);
		assert.equal(await getShadowRadius(), 5, 'getShadowRadius');
		assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
		assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
		assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

		// with mult 3
		multAdd3.params.get('mult')!.set(2);
		assert.equal(await getIntensity(), 4, 'intensity (mult 3)');
		assert.deepEqual(await getColor(), [2, 1, 0.5]);
		assert.equal(await getDistance(), 6);
		assert.equal(await getShadowBias(), 5);
		assert.equal(await getShadowRadius(), 5, 'getShadowRadius');
		assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
		assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
		assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

		// with mult 4
		multAdd4.params.get('mult')!.set(2);
		assert.equal(await getIntensity(), 4, 'intensity (mult 4)');
		assert.deepEqual(await getColor(), [2, 1, 0.5]);
		assert.equal(await getDistance(), 6);
		assert.equal(await getShadowBias(), 10);
		assert.equal(await getShadowRadius(), 5, 'getShadowRadius');
		assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
		assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
		assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

		// with mult 5
		multAdd5.params.get('mult')!.set(2);
		assert.equal(await getIntensity(), 4, 'intensity (mult 5)');
		assert.deepEqual(await getColor(), [2, 1, 0.5]);
		assert.equal(await getDistance(), 6);
		assert.equal(await getShadowBias(), 10);
		assert.equal(await getShadowRadius(), 10, 'getShadowRadius');
		assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
		assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
		assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

		// with mult 6
		multAdd6.params.get('mult')!.set(2);
		assert.equal(await getIntensity(), 4, 'intensity (mult 6)');
		assert.deepEqual(await getColor(), [2, 1, 0.5]);
		assert.equal(await getDistance(), 6);
		assert.equal(await getShadowBias(), 10);
		assert.equal(await getShadowRadius(), 10, 'getShadowRadius');
		assert.equal(await getRaymarchingPenumbra(), 0.06, 'getRaymarchingPenumbra');
		assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
		assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

		// with mult 7
		multAdd7.params.get('mult')!.set(2);
		assert.equal(await getIntensity(), 4, 'intensity (mult 7)');
		assert.deepEqual(await getColor(), [2, 1, 0.5]);
		assert.equal(await getDistance(), 6);
		assert.equal(await getShadowBias(), 10);
		assert.equal(await getShadowRadius(), 10, 'getShadowRadius');
		assert.equal(await getRaymarchingPenumbra(), 0.06, 'getRaymarchingPenumbra');
		assert.equal(await getRaymarchingShadowBiasAngle(), 0.02, 'getRaymarchingShadowBiasAngle');
		assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

		// with mult 8
		multAdd8.params.get('mult')!.set(2);
		assert.equal(await getIntensity(), 4, 'intensity (mult 8)');
		assert.deepEqual(await getColor(), [2, 1, 0.5]);
		assert.equal(await getDistance(), 6);
		assert.equal(await getShadowBias(), 10);
		assert.equal(await getShadowRadius(), 10, 'getShadowRadius');
		assert.equal(await getRaymarchingPenumbra(), 0.06, 'getRaymarchingPenumbra');
		assert.equal(await getRaymarchingShadowBiasAngle(), 0.02, 'getRaymarchingShadowBiasAngle');
		assert.equal(await getRaymarchingShadowBiasDistance(), 0.2, 'getRaymarchingShadowBiasDistance');

		// without applyToChildren
		objectBuilder1.p.group.set('');
		assert.equal(await getIntensity(), 2, 'intensity (no applyToChildren)');
		assert.deepEqual(await getColor(), [1, 0.5, 0.25]);
		assert.equal(await getDistance(), 3);
		assert.equal(await getShadowBias(), 5);
		assert.equal(await getShadowRadius(), 5, 'getShadowRadius');
		assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
		assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
		assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

		// without helper (there is still a hierarchy, as the light has a target)
		directionalLight1.p.showHelper.set(0);
		assert.equal(await getIntensity(), 2, 'intensity (no applyToChildren)');
		assert.deepEqual(await getColor(), [1, 0.5, 0.25]);
		assert.equal(await getDistance(), 3);
		assert.equal(await getShadowBias(), 5);
		assert.equal(await getShadowRadius(), 5, 'getShadowRadius');
		assert.equal(await getRaymarchingPenumbra(), 0.03, 'getRaymarchingPenumbra');
		assert.equal(await getRaymarchingShadowBiasAngle(), 0.01, 'getRaymarchingShadowBiasAngle');
		assert.equal(await getRaymarchingShadowBiasDistance(), 0.1, 'getRaymarchingShadowBiasDistance');

		// set the group instead of the applyToChildren
		objectBuilder1.p.group.set('*/directionalLight*');
		assert.equal(await getIntensity(), 4, 'intensity (mult 8)');
		assert.deepEqual(await getColor(), [2, 1, 0.5]);
		assert.equal(await getDistance(), 6);
		assert.equal(await getShadowBias(), 10);
		assert.equal(await getShadowRadius(), 10, 'getShadowRadius');
		assert.equal(await getRaymarchingPenumbra(), 0.06, 'getRaymarchingPenumbra');
		assert.equal(await getRaymarchingShadowBiasAngle(), 0.02, 'getRaymarchingShadowBiasAngle');
		assert.equal(await getRaymarchingShadowBiasDistance(), 0.2, 'getRaymarchingShadowBiasDistance');
	});
}
