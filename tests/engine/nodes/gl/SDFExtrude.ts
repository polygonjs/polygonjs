import DEFAULT_FRAGMENT from './SDFExtrude/default.frag.glsl';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {GLSLHelper} from '../../../helpers/GLSLHelper';

QUnit.test('gl/SDFExtrude', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const rayMarchingBuilder1 = MAT.createNode('rayMarchingBuilder');
	const material = await rayMarchingBuilder1.material();
	const output1 = rayMarchingBuilder1.createNode('output');

	const SDF2DCircle1 = rayMarchingBuilder1.createNode('SDF2DCircle');
	const SDFExtrude1 = rayMarchingBuilder1.createNode('SDFExtrude');
	const SDFContext1 = rayMarchingBuilder1.createNode('SDFContext');
	output1.setInput(0, SDFContext1);
	SDFExtrude1.setInput(0, SDF2DCircle1);
	SDFContext1.setInput(0, SDFExtrude1);

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
