import {LightProbe} from 'three';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';

QUnit.test('sop/lightProbe simple', async (assert) => {
	const COP = window.COP;
	const cubeMap1 = COP.createNode('cubeMap');
	cubeMap1.p.prefix.set(`${ASSETS_ROOT}/textures/cube/pisa/`);

	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const lightProbe1 = geo1.createNode('lightProbe');

	let container = await lightProbe1.compute();
	assert.ok(container);
	assert.equal(lightProbe1.states.error.message(), 'no texture node found');

	lightProbe1.p.cubeMap.setNode(cubeMap1);
	container = await lightProbe1.compute();
	assert.notOk(lightProbe1.states.error.message());
	const objects = container.coreContent()?.objects()!;
	assert.ok(objects);
	assert.ok((objects[0] as LightProbe).isLightProbe);
	const lightProbe = objects[0] as LightProbe;
	assert.in_delta(lightProbe.sh.coefficients[0].x, 1.1718, 0.001);
	assert.in_delta(lightProbe.sh.coefficients[0].y, 1.14215, 0.001);
	assert.in_delta(lightProbe.sh.coefficients[0].z, 1.0629, 0.001);
});
