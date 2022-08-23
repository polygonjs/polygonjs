import DEFAULT_FRAGMENT from './CartesianToPolar/default.frag.glsl';
import NO_INPUT_EMPTY_VERTEX from './CartesianToPolar/default.vert.glsl';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {GLSLHelper} from '../../../helpers/GLSLHelper';

QUnit.test('gl/cartesianToPolar simple', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const materialBasicBuilder1 = MAT.createNode('meshBasicBuilder');
	const material = materialBasicBuilder1.material;
	const output1 = materialBasicBuilder1.createNode('output');
	const globals1 = materialBasicBuilder1.createNode('globals');

	const cartesianToPolar1 = materialBasicBuilder1.createNode('cartesianToPolar');
	cartesianToPolar1.setInput(0, globals1, 'position');
	output1.setInput('color', cartesianToPolar1);

	assert.ok(materialBasicBuilder1.assemblerController()?.compileRequired(), 'compiled is required');
	await RendererUtils.compile(materialBasicBuilder1, renderer);
	assert.notOk(materialBasicBuilder1.assemblerController()?.compileRequired(), 'compiled is required');
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
