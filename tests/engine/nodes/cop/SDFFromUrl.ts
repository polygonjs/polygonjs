import type {QUnit} from '../../../helpers/QUnit';
import {SDFDataContainer} from '../../../../src/core/loader/geometry/SDF';
import {ASSETS_ROOT} from './../../../../src/core/loader/AssetsUtils';
export function testenginenodescopSDFFromUrl(qUnit: QUnit) {
function _url(path: string) {
	return `${ASSETS_ROOT}${path}`;
}

qUnit.test('cop/SDFFromUrl simple', async (assert) => {
	const scene = window.scene;
	const COP = scene.createNode('copNetwork');
	const SDFFromUrl1 = COP.createNode('SDFFromUrl');
	SDFFromUrl1.p.url.set(_url(`textures/sdf/SDFExporter1.bin`));

	const container = await SDFFromUrl1.compute();
	const texture = container.texture();
	const data = texture.source.data as SDFDataContainer;
	assert.equal(data.width, 40);
	assert.equal(data.height, 46);
	assert.equal(data.depth, 48);
	assert.equal(data.boundMinx, -0.7836036086082458);
	assert.equal(data.boundMiny, -0.9140761494636536);
	assert.equal(data.boundMinz, -0.940548300743103);
	assert.equal(data.boundMaxx, 0.7836036086082458);
	assert.equal(data.boundMaxy, 0.9140761494636536);
	assert.equal(data.boundMaxz, 0.940548300743103);
	assert.equal(data.data.length, 88320);
});

}