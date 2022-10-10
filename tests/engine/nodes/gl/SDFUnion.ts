import DEFAULT_FRAGMENT from './SDFUnion/default.frag.glsl';
import SDF_CONTEXT_NO_SMOOTH_FRAGMENT from './SDFUnion/sdfContextNoSmooth.frag.glsl';
import SDF_CONTEXT_WITH_SMOOTH_FRAGMENT from './SDFUnion/sdfContextWithSmooth.frag.glsl';
import NO_INPUT_EMPTY_VERTEX from './SDFUnion/default.vert.glsl';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {GLSLHelper} from '../../../helpers/GLSLHelper';

QUnit.test('gl/SDFUnion with float inputs', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const rayMarchingBuilder1 = MAT.createNode('rayMarchingBuilder');
	const material = rayMarchingBuilder1.material;
	const output1 = rayMarchingBuilder1.createNode('output');

	const SDFTransform1 = rayMarchingBuilder1.createNode('SDFTransform');
	const SDFSphere1 = rayMarchingBuilder1.createNode('SDFSphere');
	const SDFSphere2 = rayMarchingBuilder1.createNode('SDFSphere');
	const SDFUnion1 = rayMarchingBuilder1.createNode('SDFUnion');
	const SDFContext1 = rayMarchingBuilder1.createNode('SDFContext');
	output1.setInput(0, SDFContext1);
	SDFUnion1.setInput(0, SDFSphere1);
	SDFUnion1.setInput(1, SDFSphere2);
	SDFContext1.setInput(0, SDFUnion1);
	SDFSphere1.setInput(0, SDFTransform1);

	SDFUnion1.p.smooth.set(true);

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

QUnit.test('gl/SDFUnion with context inputs and no smooth', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const rayMarchingBuilder1 = MAT.createNode('rayMarchingBuilder');
	const material = rayMarchingBuilder1.material;
	const output1 = rayMarchingBuilder1.createNode('output');

	const SDFTransform1 = rayMarchingBuilder1.createNode('SDFTransform');
	const SDFSphere1 = rayMarchingBuilder1.createNode('SDFSphere');
	const SDFSphere2 = rayMarchingBuilder1.createNode('SDFSphere');
	const SDFUnion1 = rayMarchingBuilder1.createNode('SDFUnion');
	const SDFContext1 = rayMarchingBuilder1.createNode('SDFContext');
	const SDFContext2 = rayMarchingBuilder1.createNode('SDFContext');
	output1.setInput(0, SDFUnion1);
	SDFUnion1.setInput(0, SDFContext1);
	SDFUnion1.setInput(1, SDFContext2);
	SDFContext1.setInput(0, SDFSphere1);
	SDFContext2.setInput(0, SDFSphere2);
	SDFSphere1.setInput(0, SDFTransform1);

	SDFUnion1.p.smooth.set(false);

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
		GLSLHelper.compress(SDF_CONTEXT_NO_SMOOTH_FRAGMENT),
		'default fragment'
	);

	RendererUtils.dispose();
});

QUnit.test('gl/SDFUnion with context inputs and smooth', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const rayMarchingBuilder1 = MAT.createNode('rayMarchingBuilder');
	const material = rayMarchingBuilder1.material;
	const output1 = rayMarchingBuilder1.createNode('output');

	const SDFTransform1 = rayMarchingBuilder1.createNode('SDFTransform');
	const SDFSphere1 = rayMarchingBuilder1.createNode('SDFSphere');
	const SDFSphere2 = rayMarchingBuilder1.createNode('SDFSphere');
	const SDFUnion1 = rayMarchingBuilder1.createNode('SDFUnion');
	const SDFContext1 = rayMarchingBuilder1.createNode('SDFContext');
	const SDFContext2 = rayMarchingBuilder1.createNode('SDFContext');
	output1.setInput(0, SDFUnion1);
	SDFUnion1.setInput(0, SDFContext1);
	SDFUnion1.setInput(1, SDFContext2);
	SDFContext1.setInput(0, SDFSphere1);
	SDFContext2.setInput(0, SDFSphere2);
	SDFSphere1.setInput(0, SDFTransform1);

	SDFUnion1.p.smooth.set(true);
	SDFUnion1.params.get('smoothFactor')!.set(0.4);
	SDFUnion1.params.get('matBlendDist')!.set(0.2);

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
		GLSLHelper.compress(SDF_CONTEXT_WITH_SMOOTH_FRAGMENT),
		'default fragment'
	);

	RendererUtils.dispose();
});
