import {GlConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Gl';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {ColorParam} from '../../../../src/engine/params/Color';
import {AssemblersUtils} from '../../../helpers/AssemblersUtils';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {MeshBasicBuilderMatNode} from '../../../../src/engine/nodes/mat/MeshBasicBuilder';
import {BuilderUniformUpdateMatNode} from '../../../../src/engine/nodes/mat/BuilderUniformUpdate';
import {MaterialUserDataUniforms} from '../../../../src/engine/nodes/gl/code/assemblers/materials/OnBeforeCompile';
import {GLSLHelper} from '../../../helpers/GLSLHelper';
import {AdditionalType} from '../../../../src/engine/nodes/mat/BuilderUniformUpdate';

QUnit.test('mat/builderUniformUpdate simple with color param', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const meshBasicBuilder1 = MAT.createNode('meshBasicBuilder');
	const output1 = meshBasicBuilder1.createNode('output');
	// meshBasicBuilder1.createNode('globals');
	const param1 = meshBasicBuilder1.createNode('param');
	param1.p.name.set('color1');
	param1.setGlType(GlConnectionPointType.VEC3);
	param1.p.asColor.set(true);
	output1.setInput('color', param1);
	// output1.setInput('position', param2);
	await RendererUtils.compile(meshBasicBuilder1, renderer);
	const points1Material = await meshBasicBuilder1.material();

	const builderUniformUpdate1 = MAT.createNode('builderUniformUpdate');
	builderUniformUpdate1.setInput(0, meshBasicBuilder1);
	builderUniformUpdate1.setType(AdditionalType.COLOR);
	builderUniformUpdate1.p.uniformName.set('color1');

	const builderUniformUpdate1Material = (await builderUniformUpdate1.material())!;
	assert.ok(builderUniformUpdate1Material);
	await RendererUtils.compile(builderUniformUpdate1Material, renderer);

	const scene = window.scene;
	const data = await new SceneJsonExporter(scene).data();
	await AssemblersUtils.withUnregisteredAssembler(meshBasicBuilder1.usedAssembler(), async () => {
		// console.log('************ LOAD **************');
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();

		const meshBasicBuilder2 = scene2.node(meshBasicBuilder1.path()) as MeshBasicBuilderMatNode;
		const builderUniformUpdate2 = scene2.node(builderUniformUpdate1.path()) as BuilderUniformUpdateMatNode;
		assert.notOk(meshBasicBuilder2.assemblerController());
		assert.ok(meshBasicBuilder2.persisted_config);
		const param2 = meshBasicBuilder2.params.get('color1') as ColorParam;
		assert.ok(param2);
		const material = await meshBasicBuilder2.material();
		const builderUniformUpdate1Material2 = (await builderUniformUpdate2.material())!;
		assert.ok(builderUniformUpdate1Material2);
		await RendererUtils.compile(meshBasicBuilder2, renderer);
		await RendererUtils.compile(builderUniformUpdate1Material2, renderer);
		assert.equal(GLSLHelper.compress(material.fragmentShader), GLSLHelper.compress(points1Material.fragmentShader));
		assert.equal(GLSLHelper.compress(material.vertexShader), GLSLHelper.compress(points1Material.vertexShader));
		assert.equal(
			GLSLHelper.compress(material.fragmentShader),
			GLSLHelper.compress(builderUniformUpdate1Material2.fragmentShader)
		);
		assert.equal(
			GLSLHelper.compress(material.vertexShader),
			GLSLHelper.compress(builderUniformUpdate1Material2.vertexShader)
		);

		const uniformName = (paramName: string) => {
			return `v_POLY_param_${paramName}`;
		};
		const materialUniform = () => {
			return MaterialUserDataUniforms.getUniforms(material)![uniformName('color1')].value.toArray();
		};
		const builderUniformMatUniform = () => {
			return MaterialUserDataUniforms.getUniforms(builderUniformUpdate1Material2)![
				uniformName('color1')
			].value.toArray();
		};

		// param callback
		assert.deepEqual(materialUniform(), [0, 0, 0], 'A');
		assert.deepEqual(builderUniformMatUniform(), [0, 0, 0], 'B');
		param2.set([0, 0.5, 1]);
		assert.deepEqual(materialUniform(), [0, 0.5, 1], 'C');
		assert.deepEqual(builderUniformMatUniform(), [0, 0, 0], 'D');
		param2.set([1, 0.25, 0]);
		assert.deepEqual(materialUniform(), [1, 0.25, 0], 'E');
		assert.deepEqual(builderUniformMatUniform(), [0, 0, 0], 'F');
		builderUniformUpdate2.p.color.set([0, 1, 0]);
		assert.deepEqual(materialUniform(), [1, 0.25, 0], 'G');
		assert.deepEqual(builderUniformMatUniform(), [0, 1, 0], 'H');
		builderUniformUpdate2.p.color.set([0.1, 0.2, 0.3]);
		assert.deepEqual(materialUniform(), [1, 0.25, 0], 'I');
		assert.deepEqual(builderUniformMatUniform(), [0.1, 0.2, 0.3], 'J');
	});
	RendererUtils.dispose();
});
