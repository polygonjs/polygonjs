import DEFAULT_FRAGMENT from './SDFRevolution/default.frag.glsl';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {GLSLHelper} from '../../../helpers/GLSLHelper';

QUnit.test('gl/SDFRevolution', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const rayMarchingBuilder1 = MAT.createNode('rayMarchingBuilder');
	const material = rayMarchingBuilder1.material;
	const output1 = rayMarchingBuilder1.createNode('output');

	const SDF2DHeart1 = rayMarchingBuilder1.createNode('SDF2DHeart');
	const SDFRevolution1 = rayMarchingBuilder1.createNode('SDFRevolution');
	const SDFContext1 = rayMarchingBuilder1.createNode('SDFContext');
	output1.setInput(0, SDFContext1);
	SDF2DHeart1.setInput(0, SDFRevolution1);
	SDFContext1.setInput(0, SDF2DHeart1);

	assert.ok(rayMarchingBuilder1.assemblerController()?.compileRequired(), 'compiled is required');
	await RendererUtils.compile(rayMarchingBuilder1, renderer);
	assert.notOk(rayMarchingBuilder1.assemblerController()?.compileRequired(), 'compiled is required');

	assert.equal(
		GLSLHelper.compress(material.fragmentShader),
		GLSLHelper.compress(DEFAULT_FRAGMENT),
		'default fragment'
	);

	RendererUtils.dispose();
});
