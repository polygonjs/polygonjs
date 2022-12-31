import DEFAULT_FRAGMENT from './TextureSDF/default.frag.glsl';
import BLUR_FRAGMENT from './TextureSDF/blur.frag.glsl';
import NO_INPUT_EMPTY_VERTEX from './TextureSDF/default.vert.glsl';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {GLSLHelper} from '../../../helpers/GLSLHelper';

QUnit.test('gl/TextureSDF simple', async (assert) => {
	const scene = window.scene;
	// create geo and SDF texture
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	transform1.setInput(0, box1);

	const COP = scene.createNode('copNetwork');
	const SDFFromObject = COP.createNode('SDFFromObject');

	SDFFromObject.p.voxelSize.set(0.1);
	SDFFromObject.p.geometry.setNode(transform1);
	await SDFFromObject.compute();

	// create mat
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const rayMarchingBuilder1 = MAT.createNode('rayMarchingBuilder');
	const material = await rayMarchingBuilder1.material();
	const output1 = rayMarchingBuilder1.createNode('output');

	const textureSDF1 = rayMarchingBuilder1.createNode('textureSDF');
	const SDFContext1 = rayMarchingBuilder1.createNode('SDFContext');
	output1.setInput(0, SDFContext1);
	SDFContext1.setInput(0, textureSDF1);

	assert.ok(rayMarchingBuilder1.assemblerController()?.compileRequired(), 'compiled is required');
	await RendererUtils.compile(rayMarchingBuilder1, renderer);
	assert.notOk(rayMarchingBuilder1.assemblerController()?.compileRequired(), 'compiled is required');
	assert.equal(
		GLSLHelper.compress(material.vertexShader),
		GLSLHelper.compress(NO_INPUT_EMPTY_VERTEX),
		'default vertex'
	);
	assert.equal(
		GLSLHelper.compress(material.fragmentShader),
		GLSLHelper.compress(DEFAULT_FRAGMENT),
		'default fragment'
	);

	RendererUtils.dispose();
});

QUnit.test('gl/TextureSDF blur', async (assert) => {
	const scene = window.scene;
	// create geo and SDF texture
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	transform1.setInput(0, box1);

	const COP = scene.createNode('copNetwork');
	const SDFFromObject = COP.createNode('SDFFromObject');

	SDFFromObject.p.voxelSize.set(0.1);
	SDFFromObject.p.geometry.setNode(transform1);
	await SDFFromObject.compute();

	// create mat
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const rayMarchingBuilder1 = MAT.createNode('rayMarchingBuilder');
	const material = await rayMarchingBuilder1.material();
	const output1 = rayMarchingBuilder1.createNode('output');

	const textureSDF1 = rayMarchingBuilder1.createNode('textureSDF');
	const SDFContext1 = rayMarchingBuilder1.createNode('SDFContext');
	output1.setInput(0, SDFContext1);
	SDFContext1.setInput(0, textureSDF1);
	textureSDF1.p.tblur.set(true);

	assert.ok(rayMarchingBuilder1.assemblerController()?.compileRequired(), 'compiled is required');
	await RendererUtils.compile(rayMarchingBuilder1, renderer);
	assert.notOk(rayMarchingBuilder1.assemblerController()?.compileRequired(), 'compiled is required');
	assert.equal(
		GLSLHelper.compress(material.vertexShader),
		GLSLHelper.compress(NO_INPUT_EMPTY_VERTEX),
		'default vertex'
	);
	assert.equal(GLSLHelper.compress(material.fragmentShader), GLSLHelper.compress(BLUR_FRAGMENT), 'default fragment');

	RendererUtils.dispose();
});
