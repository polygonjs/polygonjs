import type {QUnit} from '../../../helpers/QUnit';
import {LightProbe} from 'three';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {CoreSleep} from '../../../../src/core/Sleep';
export function testenginenodesobjLightProbe(qUnit: QUnit) {

qUnit.test('obj/lightProbe simple', async (assert) => {
	const scene = window.scene;

	const COP = window.COP;
	const cubeMap1 = COP.createNode('cubeMap');
	cubeMap1.p.prefix.set(`${ASSETS_ROOT}/textures/cube/pisa/`);

	const lightProbe1 = scene.root().createNode('lightProbe');
	let container = await lightProbe1.compute();
	assert.ok(container);
	assert.equal(lightProbe1.states.error.message(), 'no texture node found');

	lightProbe1.p.cubeMap.setNode(cubeMap1);
	container = await lightProbe1.compute();
	assert.notOk(lightProbe1.states.error.message());
	await CoreSleep.sleep(100);
	assert.ok((lightProbe1.object.children[1] as LightProbe).isLightProbe);
	const lightProbe = lightProbe1.object.children[1] as LightProbe;
	assert.in_delta(lightProbe.sh.coefficients[0].x, 1.1718, 0.001);
	assert.in_delta(lightProbe.sh.coefficients[0].y, 1.14215, 0.001);
	assert.in_delta(lightProbe.sh.coefficients[0].z, 1.0629, 0.001);
});

}