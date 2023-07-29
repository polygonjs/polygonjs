import type {QUnit} from '../../../helpers/QUnit';
import DEFAULT_FRAGMENT from './SDFSubtract/default.frag.glsl';
import SDF_CONTEXT_NO_SMOOTH_FRAGMENT from './SDFSubtract/sdfContextNoSmooth.frag.glsl';
import SDF_CONTEXT_WITH_SMOOTH_FRAGMENT from './SDFSubtract/sdfContextWithSmooth.frag.glsl';
import NO_INPUT_EMPTY_VERTEX from './SDFSubtract/default.vert.glsl';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {GLSLHelper} from '../../../helpers/GLSLHelper';
export function testenginenodesglSDFSubtract(qUnit: QUnit) {

qUnit.test('gl/SDFSubtract with float inputs', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const rayMarchingBuilder1 = MAT.createNode('rayMarchingBuilder');
	const material = await rayMarchingBuilder1.material();
	const output1 = rayMarchingBuilder1.createNode('output');

	const SDFTransform1 = rayMarchingBuilder1.createNode('SDFTransform');
	const SDFSphere1 = rayMarchingBuilder1.createNode('SDFSphere');
	const SDFSphere2 = rayMarchingBuilder1.createNode('SDFSphere');
	const SDFSubtract1 = rayMarchingBuilder1.createNode('SDFSubtract');
	const SDFContext1 = rayMarchingBuilder1.createNode('SDFContext');
	output1.setInput(0, SDFContext1);
	SDFSubtract1.setInput(0, SDFSphere1);
	SDFSubtract1.setInput(1, SDFSphere2);
	SDFContext1.setInput(0, SDFSubtract1);
	SDFSphere1.setInput(0, SDFTransform1);

	SDFSubtract1.p.smooth.set(true);

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

qUnit.test('gl/SDFSubtract with context inputs and no smooth', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const rayMarchingBuilder1 = MAT.createNode('rayMarchingBuilder');
	const material = await rayMarchingBuilder1.material();
	const output1 = rayMarchingBuilder1.createNode('output');

	const SDFTransform1 = rayMarchingBuilder1.createNode('SDFTransform');
	const SDFSphere1 = rayMarchingBuilder1.createNode('SDFSphere');
	const SDFSphere2 = rayMarchingBuilder1.createNode('SDFSphere');
	const SDFSubtract1 = rayMarchingBuilder1.createNode('SDFSubtract');
	const SDFContext1 = rayMarchingBuilder1.createNode('SDFContext');
	const SDFContext2 = rayMarchingBuilder1.createNode('SDFContext');
	output1.setInput(0, SDFSubtract1);
	SDFSubtract1.setInput(0, SDFContext1);
	SDFSubtract1.setInput(1, SDFContext2);
	SDFContext1.setInput(0, SDFSphere1);
	SDFContext2.setInput(0, SDFSphere2);
	SDFSphere1.setInput(0, SDFTransform1);

	SDFSubtract1.p.smooth.set(false);

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

qUnit.test('gl/SDFSubtract with context inputs and smooth', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const rayMarchingBuilder1 = MAT.createNode('rayMarchingBuilder');
	const material = await rayMarchingBuilder1.material();
	const output1 = rayMarchingBuilder1.createNode('output');

	const SDFTransform1 = rayMarchingBuilder1.createNode('SDFTransform');
	const SDFSphere1 = rayMarchingBuilder1.createNode('SDFSphere');
	const SDFSphere2 = rayMarchingBuilder1.createNode('SDFSphere');
	const SDFSubtract1 = rayMarchingBuilder1.createNode('SDFSubtract');
	const SDFContext1 = rayMarchingBuilder1.createNode('SDFContext');
	const SDFContext2 = rayMarchingBuilder1.createNode('SDFContext');
	output1.setInput(0, SDFSubtract1);
	SDFSubtract1.setInput(0, SDFContext1);
	SDFSubtract1.setInput(1, SDFContext2);
	SDFContext1.setInput(0, SDFSphere1);
	SDFContext2.setInput(0, SDFSphere2);
	SDFSphere1.setInput(0, SDFTransform1);

	SDFSubtract1.p.smooth.set(true);
	SDFSubtract1.params.get('smoothFactor')!.set(0.4);
	SDFSubtract1.params.get('matBlendDist')!.set(0.2);

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

}