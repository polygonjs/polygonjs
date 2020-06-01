import {CoreSleep} from '../../../../src/core/Sleep';
import {GlConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Gl';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine';
import {FloatParam} from '../../../../src/engine/params/Float';
import {BuilderCopNode} from '../../../../src/engine/nodes/cop/Builder';
import {Vector3Param} from '../../../../src/engine/params/Vector3';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {AssemblersUtils} from '../../../helpers/AssemblersUtils';

QUnit.test('COP builder simple with render target', async (assert) => {
	const scene = window.scene;
	await scene.wait_for_cooks_completed();

	// create a renderer first
	const {renderer} = await RendererUtils.wait_for_renderer();
	assert.ok(renderer);

	// start test
	const COP = window.COP;
	// const MAT = window.MAT
	const builder1 = COP.create_node('builder');
	builder1.p.use_camera_renderer.set(1);
	// currently no need to tie it to a material to have it recook
	// currently use a mat to have the builder recook
	// const mesh_basic_builder1 = MAT.create_node('mesh_basic_builder')
	// mesh_basic_builder1.p.use_map.set(1)
	// mesh_basic_builder1.p.map.set(builder1.full_path())

	let container = await builder1.request_container();
	assert.ok(!builder1.states.error.message);
	let texture = container.texture();
	assert.equal(texture.image.width, 256);
	assert.equal(texture.image.height, 256);

	const render_target = builder1.render_target();
	const buffer_width = 1;
	const buffer_height = 1;
	const pixelBuffer = new Float32Array(buffer_width * buffer_height * 4);
	renderer.readRenderTargetPixels(render_target, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [0, 0, 0, 1].join(':'), 'black with alpha 1');

	const float_to_vec31 = builder1.create_node('float_to_vec3');
	const output1 = builder1.nodes_by_type('output')[0];
	const globals1 = builder1.nodes_by_type('globals')[0];
	output1.set_input('color', float_to_vec31);
	float_to_vec31.set_input('x', globals1, 'time');
	scene.set_frame(30);
	assert.equal(scene.time, 0.5);
	await CoreSleep.sleep(10);
	renderer.readRenderTargetPixels(render_target, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [0.5, 0, 0, 1].join(':'));

	scene.set_frame(60);
	assert.equal(scene.time, 1);
	await CoreSleep.sleep(10);
	renderer.readRenderTargetPixels(render_target, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [1.0, 0, 0, 1].join(':'));

	RendererUtils.dispose();
});

QUnit.test('COP builder simple with data texture', async (assert) => {
	const scene = window.scene;
	await scene.wait_for_cooks_completed();

	const COP = window.COP;
	const builder1 = COP.create_node('builder');
	// currently no need to tie it to a material to have it recook
	// currently use a mat to have the builder recook
	// const mesh_basic_builder1 = MAT.create_node('mesh_basic_builder')
	// mesh_basic_builder1.p.use_map.set(1)
	// mesh_basic_builder1.p.map.set(builder1.full_path())

	let container = await builder1.request_container();
	assert.ok(!builder1.states.error.message);
	let texture = container.texture();
	assert.equal(texture.image.width, 256);
	assert.equal(texture.image.height, 256);

	const pixelBuffer = texture.image.data;
	assert.deepEqual(pixelBuffer.slice(0, 4).join(':'), [0, 0, 0, 1].join(':'), 'black with alpha 1');

	const float_to_vec31 = builder1.create_node('float_to_vec3');
	const output1 = builder1.nodes_by_type('output')[0];
	const globals1 = builder1.nodes_by_type('globals')[0];
	output1.set_input('color', float_to_vec31);
	float_to_vec31.set_input('x', globals1, 'time');
	scene.set_frame(30);
	assert.equal(scene.time, 0.5);
	await CoreSleep.sleep(10);
	assert.deepEqual(pixelBuffer.slice(0, 4).join(':'), [0.5, 0, 0, 1].join(':'));

	scene.set_frame(60);
	assert.equal(scene.time, 1);
	await CoreSleep.sleep(10);
	assert.deepEqual(pixelBuffer.slice(0, 4).join(':'), [1.0, 0, 0, 1].join(':'));
});

QUnit.test('COP builder with persisted_config', async (assert) => {
	const scene = window.scene;
	await scene.wait_for_cooks_completed();

	const COP = window.COP;
	const builder1 = COP.create_node('builder');

	const output1 = builder1.nodes_by_type('output')[0];
	const globals1 = builder1.nodes_by_type('globals')[0];
	const param1 = builder1.create_node('param');
	param1.p.name.set('float_param');
	const param2 = builder1.create_node('param');
	param2.set_gl_type(GlConnectionPointType.VEC3);
	param2.p.name.set('vec3_param');
	const float_to_vec31 = builder1.create_node('float_to_vec3');
	float_to_vec31.set_input(0, param1);
	float_to_vec31.set_input(1, globals1, 'time');
	output1.set_input('color', float_to_vec31);
	await builder1.request_container();

	const data = new SceneJsonExporter(scene).data();
	await AssemblersUtils.with_unregistered_assembler(builder1.used_assembler(), async () => {
		console.log('************ LOAD **************');
		const scene2 = await SceneJsonImporter.load_data(data);
		await scene2.wait_for_cooks_completed();

		const new_builder1 = scene2.node('/COP/builder1') as BuilderCopNode;
		assert.notOk(new_builder1.assembler_controller);
		assert.ok(new_builder1.persisted_config);
		const float_param = new_builder1.params.get('float_param') as FloatParam;
		const vec3_param = new_builder1.params.get('vec3_param') as Vector3Param;
		assert.ok(float_param);
		assert.ok(vec3_param);
		const material = new_builder1.texture_material;
		assert.equal(material.fragmentShader, builder1.texture_material.fragmentShader);
		assert.equal(material.vertexShader, builder1.texture_material.vertexShader);

		// float param callback
		assert.equal(material.uniforms.v_POLY_param1_val.value, 0);
		float_param.set(2);
		assert.equal(material.uniforms.v_POLY_param1_val.value, 2);
		float_param.set(4);
		assert.equal(material.uniforms.v_POLY_param1_val.value, 4);

		// vector3 param callback
		assert.deepEqual(material.uniforms.v_POLY_param2_val.value.toArray(), [0, 0, 0]);
		vec3_param.set([1, 2, 3]);
		assert.deepEqual(material.uniforms.v_POLY_param2_val.value.toArray(), [1, 2, 3]);
		vec3_param.set([5, 6, 7]);
		assert.deepEqual(material.uniforms.v_POLY_param2_val.value.toArray(), [5, 6, 7]);
	});
});
