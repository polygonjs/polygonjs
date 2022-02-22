import {Mesh} from 'three/src/objects/Mesh';
import {Material} from 'three/src/materials/Material';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {MaterialUserDataUniforms} from '../../../../src/engine/nodes/gl/code/assemblers/materials/OnBeforeCompile';
import {ShaderLib} from 'three/src/renderers/shaders/ShaderLib';
import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
import {GlConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Gl';

const LAMBERT_UNIFORMS = UniformsUtils.clone(ShaderLib.lambert.uniforms);
const LAMBERT_UNIFORM_NAMES = Object.keys(LAMBERT_UNIFORMS).concat(['clippingPlanes']).sort();

QUnit.test('materials simple', async (assert) => {
	const geo1 = window.geo1;
	const MAT = window.MAT;

	const plane1 = geo1.createNode('plane');
	const material1 = geo1.createNode('material');
	const lambert1 = MAT.createNode('meshLambert');

	material1.setInput(0, plane1);
	material1.p.material.set(lambert1.path());

	let container;

	container = await material1.compute();
	const first_object = container.coreContent()!.objects()[0] as Mesh;
	const material = first_object.material as Material;
	assert.equal(material.uuid, lambert1.material.uuid);
});

QUnit.test('materials clone', async (assert) => {
	const geo1 = window.geo1;
	const MAT = window.MAT;

	const lambert1 = MAT.createNode('meshLambert');
	const plane1 = geo1.createNode('plane');
	const attrib_create1 = geo1.createNode('attribCreate');
	const material1 = geo1.createNode('material');
	const copy1 = geo1.createNode('copy');

	attrib_create1.setInput(0, plane1);
	material1.setInput(0, attrib_create1);
	copy1.setInput(0, material1);
	material1.p.material.set(lambert1.path());

	attrib_create1.p.name.set('id');
	attrib_create1.p.value1.set(`copy('${copy1.path()}', 0)`);
	material1.p.cloneMat.set(1);
	copy1.p.count.set(2);
	copy1.p.useCopyExpr.set(1);

	let container;

	container = await copy1.compute();
	const objects = container.coreContent()!.objects() as Mesh[];
	assert.equal(objects.length, 2);
	const src_material = lambert1.material;
	assert.notEqual(src_material.uuid, (objects[0].material as Material).uuid);
	assert.notEqual(src_material.uuid, (objects[1].material as Material).uuid);
});

QUnit.test('materials clone preserves builder onBeforeCompile', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const geo1 = window.geo1;
	const MAT = window.MAT;

	const meshLambertBuilder1 = MAT.createNode('meshLambertBuilder');
	const plane1 = geo1.createNode('plane');
	const attrib_create1 = geo1.createNode('attribCreate');
	const material1 = geo1.createNode('material');
	const copy1 = geo1.createNode('copy');

	attrib_create1.setInput(0, plane1);
	material1.setInput(0, attrib_create1);
	copy1.setInput(0, material1);
	material1.p.material.set(meshLambertBuilder1.path());

	const param1 = meshLambertBuilder1.createNode('param');
	const output1 = meshLambertBuilder1.createNode('output');
	param1.setGlType(GlConnectionPointType.FLOAT);
	param1.p.name.set('customAlpha');
	assert.equal(param1.uniformName(), 'v_POLY_param_customAlpha');
	output1.setInput('alpha', param1);

	attrib_create1.p.name.set('id');
	attrib_create1.p.value1.set(`copy('${copy1.path()}', 0)`);
	material1.p.cloneMat.set(1);
	copy1.p.count.set(2);
	copy1.p.useCopyExpr.set(1);

	let container;

	// share uniforms

	async function getCompiledMaterials() {
		container = await copy1.compute();
		const objects = container.coreContent()!.objects() as Mesh[];
		assert.equal(objects.length, 2);
		const srcMaterial = meshLambertBuilder1.material;
		const materialObject0 = objects[0].material as Material;
		const materialObject1 = objects[1].material as Material;
		assert.notEqual(srcMaterial.uuid, materialObject0.uuid);
		assert.notEqual(srcMaterial.uuid, materialObject1.uuid);
		assert.notEqual(materialObject0.uuid, materialObject1.uuid);

		await RendererUtils.compile(srcMaterial, renderer);
		await RendererUtils.compile(materialObject0, renderer);
		await RendererUtils.compile(materialObject1, renderer);

		return {srcMaterial, materialObject0, materialObject1};
	}
	async function testWithShareUniforms() {
		material1.p.shareCustomUniforms.set(1);
		const {srcMaterial, materialObject0, materialObject1} = await getCompiledMaterials();

		const currentUniformNames = LAMBERT_UNIFORM_NAMES.concat(['v_POLY_param_customAlpha']);
		assert.deepEqual(
			Object.keys(MaterialUserDataUniforms.getUniforms(srcMaterial)!).sort(),
			currentUniformNames,
			'uniforms are as expected with sharing'
		);
		assert.deepEqual(
			Object.keys(MaterialUserDataUniforms.getUniforms(materialObject0)!).sort(),
			currentUniformNames
		);
		assert.deepEqual(
			Object.keys(MaterialUserDataUniforms.getUniforms(materialObject1)!).sort(),
			currentUniformNames
		);

		MaterialUserDataUniforms.getUniforms(srcMaterial)!.alphaTest.value = 0.7;
		MaterialUserDataUniforms.getUniforms(srcMaterial)!.v_POLY_param_customAlpha.value = 0.55;
		assert.equal(
			MaterialUserDataUniforms.getUniforms(materialObject0)!.alphaTest.value,
			0.0,
			'alphaTest is different'
		);
		assert.equal(
			MaterialUserDataUniforms.getUniforms(materialObject0)!.v_POLY_param_customAlpha.value,
			0.55,
			'param uniform is the same'
		);
		assert.equal(
			MaterialUserDataUniforms.getUniforms(materialObject1)!.alphaTest.value,
			0.0,
			'alphaTest is different'
		);
		assert.equal(
			MaterialUserDataUniforms.getUniforms(materialObject1)!.v_POLY_param_customAlpha.value,
			0.55,
			'param uniform is the same'
		);

		// and the cloned materials are different from each other
		MaterialUserDataUniforms.getUniforms(materialObject0)!.alphaTest.value = 0.3;
		assert.equal(
			MaterialUserDataUniforms.getUniforms(materialObject1)!.alphaTest.value,
			0.0,
			'alphaTest is different'
		);

		// and if I changed the custom uniform of a cloned material, the other materials follow
		MaterialUserDataUniforms.getUniforms(materialObject0)!.v_POLY_param_customAlpha.value = 0.4;
		assert.equal(
			MaterialUserDataUniforms.getUniforms(srcMaterial)!.v_POLY_param_customAlpha.value,
			0.4,
			'main mat follows'
		);
		assert.equal(
			MaterialUserDataUniforms.getUniforms(materialObject1)!.v_POLY_param_customAlpha.value,
			0.4,
			'main mat follows'
		);
	}
	async function testWithoutShareUniforms() {
		material1.p.shareCustomUniforms.set(0);
		const {srcMaterial, materialObject0, materialObject1} = await getCompiledMaterials();

		const currentUniformNames = LAMBERT_UNIFORM_NAMES.concat(['v_POLY_param_customAlpha']);
		assert.deepEqual(
			Object.keys(MaterialUserDataUniforms.getUniforms(srcMaterial)!).sort(),
			currentUniformNames,
			'uniforms are as expected when not sharing'
		);
		assert.deepEqual(
			Object.keys(MaterialUserDataUniforms.getUniforms(materialObject0)!).sort(),
			currentUniformNames
		);
		assert.deepEqual(
			Object.keys(MaterialUserDataUniforms.getUniforms(materialObject1)!).sort(),
			currentUniformNames
		);

		MaterialUserDataUniforms.getUniforms(srcMaterial)!.alphaTest.value = 0.7;
		MaterialUserDataUniforms.getUniforms(srcMaterial)!.v_POLY_param_customAlpha.value = 0.55;
		assert.equal(
			MaterialUserDataUniforms.getUniforms(materialObject0)!.alphaTest.value,
			0,
			'alphaTest is different'
		);
		assert.equal(
			MaterialUserDataUniforms.getUniforms(materialObject0)!.v_POLY_param_customAlpha.value,
			0,
			'param uniform is different'
		);
		assert.equal(
			MaterialUserDataUniforms.getUniforms(materialObject1)!.alphaTest.value,
			0,
			'alphaTest is different'
		);
		assert.equal(
			MaterialUserDataUniforms.getUniforms(materialObject1)!.v_POLY_param_customAlpha.value,
			0,
			'param uniform is different'
		);

		// and if I changed the custom uniform of a cloned material, the other materials do not follow
		MaterialUserDataUniforms.getUniforms(materialObject0)!.v_POLY_param_customAlpha.value = 0.4;
		assert.equal(
			MaterialUserDataUniforms.getUniforms(srcMaterial)!.v_POLY_param_customAlpha.value,
			0.55,
			'main mat follows'
		);
		assert.equal(
			MaterialUserDataUniforms.getUniforms(materialObject1)!.v_POLY_param_customAlpha.value,
			0,
			'main mat follows'
		);
	}

	await testWithShareUniforms();
	await testWithoutShareUniforms();

	RendererUtils.dispose();
});
