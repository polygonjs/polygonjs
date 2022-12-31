import DEFAULT_FRAGMENT from './SDFTwist/default.frag.glsl';
import NO_INPUT_EMPTY_VERTEX from './SDFTwist/default.vert.glsl';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {GLSLHelper} from '../../../helpers/GLSLHelper';

QUnit.test('gl/SDFTwist simple', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const rayMarchingBuilder1 = MAT.createNode('rayMarchingBuilder');
	const material = await rayMarchingBuilder1.material();
	const output1 = rayMarchingBuilder1.createNode('output');

	const SDFTwist1 = rayMarchingBuilder1.createNode('SDFTwist');
	const SDFSphere1 = rayMarchingBuilder1.createNode('SDFSphere');
	const SDFContext1 = rayMarchingBuilder1.createNode('SDFContext');
	output1.setInput(0, SDFContext1);
	SDFContext1.setInput(0, SDFSphere1);
	SDFSphere1.setInput(0, SDFTwist1);

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
