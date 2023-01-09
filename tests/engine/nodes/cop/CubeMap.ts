import {CubeTexture} from 'three';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';

QUnit.test('cop/cubeMap simple', async (assert) => {
	const COP = window.COP;
	const cubeMap1 = COP.createNode('cubeMap');
	cubeMap1.p.prefix.set(`${ASSETS_ROOT}/textures/cube/pisa/`);

	let container = await cubeMap1.compute();
	assert.equal(cubeMap1.states.error.message(), null);
	assert.ok(!cubeMap1.states.error.active());
	let texture = container.coreContent();
	assert.ok((texture as CubeTexture).isCubeTexture);
	assert.equal(texture.source.data.length, 6);
	assert.equal(texture.source.data[0].width, 256);
	assert.equal(texture.source.data[0].height, 256);
});
