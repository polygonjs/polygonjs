import {GlConnectionPointType} from '../../../../../src/engine/nodes/utils/io/connections/Gl';
import {RendererUtils} from '../../../../helpers/RendererUtils';

QUnit.test('2 gl/attributes with same name can live on same level without conflict in a material', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);

	const MAT = window.MAT;
	const meshBasicBuilder1 = MAT.createNode('meshBasicBuilder');
	const output1 = meshBasicBuilder1.createNode('output');
	const attribute1 = meshBasicBuilder1.createNode('attribute');
	const attribute2 = meshBasicBuilder1.createNode('attribute');
	const add1 = meshBasicBuilder1.createNode('add');
	for (let attribNode of [attribute1, attribute2]) {
		attribNode.p.name.set('myAttrib');
		attribNode.setGlType(GlConnectionPointType.VEC3);
	}
	add1.setInput(0, attribute1);
	add1.setInput(1, attribute2);

	// test for vertex only
	output1.setInput('position', add1);
	await RendererUtils.compile(meshBasicBuilder1, renderer);
	// await meshBasicBuilder1.compute();
	const material = meshBasicBuilder1.material;
	assert.includes(
		material.vertexShader,
		`
// /MAT/meshBasicBuilder1/attribute1
attribute vec3 myAttrib;
`,
		'vertexShader with vertex attribs only (attrib declaration)'
	);
	assert.includes(
		material.vertexShader,
		`
	// /MAT/meshBasicBuilder1/attribute1
	vec3 v_POLY_attribute1_val = myAttrib;
	
	// /MAT/meshBasicBuilder1/attribute2
	vec3 v_POLY_attribute2_val = myAttrib;
`,
		'vertexShader with vertex attribs only (attrib read body lines)'
	);
	assert.not_includes(material.fragmentShader, 'attribute1');

	// test for fragment only
	output1.setInput('position', null);
	output1.setInput('color', add1);
	await RendererUtils.compile(meshBasicBuilder1, renderer);
	// await meshBasicBuilder1.compute();
	assert.includes(
		material.vertexShader,
		`
// /MAT/meshBasicBuilder1/attribute1
varying vec3 v_POLY_attribute_myAttrib;

// /MAT/meshBasicBuilder1/attribute1
attribute vec3 myAttrib;
`,
		'vertexShader with attribs attrib declaration for fragmentShader (declaration)'
	);
	assert.includes(
		material.vertexShader,
		`
	// /MAT/meshBasicBuilder1/attribute1
	v_POLY_attribute_myAttrib = vec3(myAttrib);
	
	// /MAT/meshBasicBuilder1/attribute2
	v_POLY_attribute_myAttrib = vec3(myAttrib);
`,
		'vertexShader with attribs attrib declaration for fragmentShader (read)'
	);
	assert.includes(
		material.fragmentShader,
		`
// /MAT/meshBasicBuilder1/attribute1
varying vec3 v_POLY_attribute_myAttrib;
`,
		'fragmentShader reads varying declared in vertexShader (definition)'
	);

	assert.includes(
		material.fragmentShader,
		`
	// /MAT/meshBasicBuilder1/attribute1
	vec3 v_POLY_attribute1_val = v_POLY_attribute_myAttrib;
	
	// /MAT/meshBasicBuilder1/attribute2
	vec3 v_POLY_attribute2_val = v_POLY_attribute_myAttrib;
	
	// /MAT/meshBasicBuilder1/add1
	vec3 v_POLY_add1_sum = (v_POLY_attribute1_val + v_POLY_attribute2_val + vec3(0.0, 0.0, 0.0));
	
	// /MAT/meshBasicBuilder1/output1
	diffuseColor.xyz = v_POLY_add1_sum;
`,
		'fragmentShader reads varying declared in vertexShader (body)'
	);

	RendererUtils.dispose();
});

QUnit.test('2 gl/param with same name can live on same level without conflict in a material', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);

	const MAT = window.MAT;
	const meshBasicBuilder1 = MAT.createNode('meshBasicBuilder');
	const output1 = meshBasicBuilder1.createNode('output');
	const param1 = meshBasicBuilder1.createNode('param');
	const param2 = meshBasicBuilder1.createNode('param');
	const add1 = meshBasicBuilder1.createNode('add');
	for (let paramNode of [param1, param2]) {
		paramNode.p.name.set('myParam');
		paramNode.setGlType(GlConnectionPointType.VEC3);
	}
	add1.setInput(0, param1);
	add1.setInput(1, param2);

	// test for vertex only
	output1.setInput('position', add1);
	await RendererUtils.compile(meshBasicBuilder1, renderer);
	const material = meshBasicBuilder1.material;
	assert.includes(
		material.vertexShader,
		`
// /MAT/meshBasicBuilder1/param1
uniform vec3 v_POLY_param_myParam;
`,
		'vertexShader with vertex params only (param declaration)'
	);
	assert.includes(
		material.vertexShader,
		`
	// /MAT/meshBasicBuilder1/param1
	vec3 v_POLY_param1_val = v_POLY_param_myParam;
	
	// /MAT/meshBasicBuilder1/param2
	vec3 v_POLY_param2_val = v_POLY_param_myParam;
`,
		'vertexShader with vertex params only (param read body lines)'
	);
	assert.not_includes(material.fragmentShader, 'uniform vec3 v_POLY_');

	// test for fragment only
	output1.setInput('position', null);
	output1.setInput('color', add1);
	await RendererUtils.compile(meshBasicBuilder1, renderer);
	// await meshBasicBuilder1.compute();
	assert.not_includes(material.vertexShader, 'uniform vec3 v_POLY_');
	assert.includes(
		material.fragmentShader,
		`
// /MAT/meshBasicBuilder1/param1
uniform vec3 v_POLY_param_myParam;
`,
		'fragmentShader reads what is declared in vertexShader (definition)'
	);

	assert.includes(
		material.fragmentShader,
		`
	// /MAT/meshBasicBuilder1/param1
	vec3 v_POLY_param1_val = v_POLY_param_myParam;
	
	// /MAT/meshBasicBuilder1/param2
	vec3 v_POLY_param2_val = v_POLY_param_myParam;
	
	// /MAT/meshBasicBuilder1/add1
	vec3 v_POLY_add1_sum = (v_POLY_param1_val + v_POLY_param2_val + vec3(0.0, 0.0, 0.0));
	
	// /MAT/meshBasicBuilder1/output1
	diffuseColor.xyz = v_POLY_add1_sum;
`,
		'fragmentShader reads what is declared in vertexShader (body)'
	);
});
