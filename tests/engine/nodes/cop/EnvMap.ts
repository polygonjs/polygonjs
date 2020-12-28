import {RendererUtils} from '../../../helpers/RendererUtils';
import {ASSETS_ROOT} from '../../../helpers/AssetsUtils';

QUnit.test('COP env_map simple', async (assert) => {
	const {renderer} = await RendererUtils.wait_for_renderer();
	assert.ok(renderer);

	// start test
	const COP = window.COP;
	const file1 = COP.createNode('image');
	const env_map1 = COP.createNode('envMap');

	env_map1.setInput(0, file1);

	file1.p.url.set(`${ASSETS_ROOT}/textures/piz_compressed.exr`);

	let container = await env_map1.request_container();
	assert.ok(!env_map1.states.error.active);
	let texture = container.core_content();
	assert.equal(texture.image.width, 768);
	assert.equal(texture.image.height, 768);

	RendererUtils.dispose();
});
