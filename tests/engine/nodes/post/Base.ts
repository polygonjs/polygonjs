import {CoreSleep} from '../../../../src/core/Sleep';
import {ShaderPass} from '../../../../src/modules/three/examples/jsm/postprocessing/ShaderPass';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {HorizontalBlurShader} from '../../../../src/modules/three/examples/jsm/shaders/HorizontalBlurShader';
import {VerticalBlurShader} from '../../../../src/modules/three/examples/jsm/shaders/VerticalBlurShader';
import {UnrealBloomPass} from '../../../../src/modules/three/examples/jsm/postprocessing/UnrealBloomPass';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('Post nodes simple', async (assert) => {
	const scene = window.scene;
	await scene.wait_for_cooks_completed();

	const {renderer, canvas} = await RendererUtils.wait_for_renderer();
	assert.ok(renderer);

	// start test
	const camera = scene.root.nodes_by_type('perspective_camera')[0];
	const post_process1 = camera.create_node('post_process');
	const horizontal_blur1 = post_process1.create_node('horizontal_blur');

	assert.ok(horizontal_blur1.flags?.display?.active, 'first node created has display flag on');

	camera.p.do_post_process.set(1);
	camera.p.post_process_node.set(post_process1.full_path());
	await CoreSleep.sleep(20);

	// 2 passes by default
	let composer = camera.post_process_controller.composer(canvas);
	assert.ok(composer, 'composer exists');
	assert.equal(composer.passes.length, 2, 'composer has two passes');
	assert.equal(
		((composer.passes[1] as ShaderPass).material as ShaderMaterial).fragmentShader,
		HorizontalBlurShader.fragmentShader
	);

	// 1 pass if no prepend
	post_process1.p.prepend_render_pass.set(0);
	await CoreSleep.sleep(20);
	composer = camera.post_process_controller.composer(canvas);
	assert.ok(composer, 'composer exists');
	assert.equal(composer.passes.length, 1, 'composer one pass');
	assert.equal(
		((composer.passes[0] as ShaderPass).material as ShaderMaterial).fragmentShader,
		HorizontalBlurShader.fragmentShader
	);

	// add another pass and add as input to the first one
	const vertical_blur1 = post_process1.create_node('vertical_blur');
	horizontal_blur1.set_input(0, vertical_blur1);
	await CoreSleep.sleep(20);
	composer = camera.post_process_controller.composer(canvas);
	assert.equal(composer.passes.length, 2, 'composer has two passes');
	assert.equal(
		((composer.passes[1] as ShaderPass).material as ShaderMaterial).fragmentShader,
		HorizontalBlurShader.fragmentShader
	);
	assert.equal(
		((composer.passes[0] as ShaderPass).material as ShaderMaterial).fragmentShader,
		VerticalBlurShader.fragmentShader
	);

	// add another and set the display flag to it
	const unreal_bloom1 = post_process1.create_node('unreal_bloom');
	unreal_bloom1.flags.display.set(true);
	composer = camera.post_process_controller.composer(canvas);
	assert.equal(composer.passes.length, 1, 'composer has one pass');
	assert.equal(
		(composer.passes[0] as UnrealBloomPass).compositeMaterial.fragmentShader,
		'varying vec2 vUv;				uniform sampler2D blurTexture1;				uniform sampler2D blurTexture2;				uniform sampler2D blurTexture3;				uniform sampler2D blurTexture4;				uniform sampler2D blurTexture5;				uniform sampler2D dirtTexture;				uniform float bloomStrength;				uniform float bloomRadius;				uniform float bloomFactors[NUM_MIPS];				uniform vec3 bloomTintColors[NUM_MIPS];								float lerpBloomFactor(const in float factor) { 					float mirrorFactor = 1.2 - factor;					return mix(factor, mirrorFactor, bloomRadius);				}								void main() {					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) + 													 lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) + 													 lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) + 													 lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) + 													 lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );				}'
	);

	// change display flag again
	vertical_blur1.flags.display.set(true);
	composer = camera.post_process_controller.composer(canvas);
	assert.equal(composer.passes.length, 1, 'composer has one pass');
	assert.equal(
		((composer.passes[0] as ShaderPass).material as ShaderMaterial).fragmentShader,
		VerticalBlurShader.fragmentShader
	);

	// change display flag again
	horizontal_blur1.flags.display.set(true);
	composer = camera.post_process_controller.composer(canvas);
	assert.equal(composer.passes.length, 2, 'composer has two passes');
	assert.equal(
		((composer.passes[1] as ShaderPass).material as ShaderMaterial).fragmentShader,
		HorizontalBlurShader.fragmentShader
	);
	assert.equal(
		((composer.passes[0] as ShaderPass).material as ShaderMaterial).fragmentShader,
		VerticalBlurShader.fragmentShader
	);

	RendererUtils.dispose();
});
