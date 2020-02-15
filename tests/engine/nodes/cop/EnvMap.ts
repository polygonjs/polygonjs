// this needs a renderer
QUnit.skip('COP env_map simple', async (assert) => {
	const COP = window.COP;
	const file1 = COP.create_node('file');
	const env_map1 = COP.create_node('env_map');

	env_map1.set_input(0, file1);

	file1.p.url.set('/examples/textures/piz_compressed.exr');

	let container, texture;

	container = await env_map1.request_container();
	console.log('container', container, env_map1.states.error.message);
	texture = container.core_content();
	assert.equal(texture.image.width, 1024);
	assert.equal(texture.image.height, 1024);
});
