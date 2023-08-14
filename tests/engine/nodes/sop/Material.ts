import type {QUnit} from '../../../helpers/QUnit';
import {Mesh, ShaderMaterial} from 'three';
import {Material} from 'three';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {MaterialUserDataUniforms} from '../../../../src/engine/nodes/gl/code/assemblers/materials/OnBeforeCompile';
import {ShaderLib} from 'three';
import {UniformsUtils} from 'three';
import {GlConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Gl';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {Object3D} from 'three';
import {HierarchyMode} from '../../../../src/engine/operations/sop/Hierarchy';
import {CoreType} from '../../../../src/core/Type';
import {CoreObjectType, ObjectContent} from '../../../../src/core/geometry/ObjectContent';
import {CustomMaterialName, MaterialWithCustomMaterials} from '../../../../src/core/geometry/Material';
// import {CorePath} from '../../../../src/core/geometry/CorePath';
export function testenginenodessopMaterial(qUnit: QUnit) {
	const LAMBERT_UNIFORMS = UniformsUtils.clone(ShaderLib.lambert.uniforms);
	const LAMBERT_UNIFORM_NAMES = Object.keys(LAMBERT_UNIFORMS).concat(['clippingPlanes']).sort();

	qUnit.test('sop/material simple', async (assert) => {
		const geo1 = window.geo1;
		const MAT = window.MAT;

		const plane1 = geo1.createNode('plane');
		const material1 = geo1.createNode('material');
		const lambert1 = MAT.createNode('meshLambert');

		material1.setInput(0, plane1);
		material1.p.material.set(lambert1.path());

		let container;

		container = await material1.compute();
		const first_object = container.coreContent()!.allObjects()[0] as Mesh;
		const material = first_object.material as Material;
		assert.equal(material.uuid, (await lambert1.material()).uuid);
	});

	qUnit.test('sop/material clone', async (assert) => {
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
		const objects = container.coreContent()!.allObjects() as Mesh[];
		assert.equal(objects.length, 2);
		const src_material = await lambert1.material();
		assert.notEqual(src_material.uuid, (objects[0].material as Material).uuid);
		assert.notEqual(src_material.uuid, (objects[1].material as Material).uuid);
	});

	qUnit.test('sop/material access group by object name', async (assert) => {
		const geo1 = window.geo1;
		const MAT = window.MAT;

		const file1 = geo1.createNode('fileGLTF');
		file1.p.url.set(`${ASSETS_ROOT}/models/SheenChair.glb`);
		const hierarchy1 = geo1.createNode('hierarchy');
		hierarchy1.setMode(HierarchyMode.REMOVE_PARENT);
		hierarchy1.setInput(0, file1);
		const lambert1 = MAT.createNode('meshLambert');
		const material1 = geo1.createNode('material');
		material1.p.material.setNode(lambert1);
		material1.setInput(0, hierarchy1);

		const container1 = await hierarchy1.compute();
		const coreContent = container1.coreContent()!;
		const objects = coreContent.allObjects();
		assert.equal(objects.length, 4);
		const objectNames = objects.map((o: ObjectContent<CoreObjectType>) => o.name);
		const objectNamesSorted = [...objectNames].sort();
		assert.deepEqual(
			objectNamesSorted.sort(),
			['SheenChair_metal', 'SheenChair_wood', 'SheenChair_label', 'SheenChair_fabric'].sort()
		);

		async function getObjects() {
			const container1 = await material1.compute();
			const coreContent = container1.coreContent()!;
			const objects = coreContent.allObjects();
			return objects as Mesh[];
		}

		material1.p.group.set('SheenChair_fabric');
		const objects1 = await getObjects();
		assert.notEqual(
			(objects1[objectNames.indexOf('SheenChair_label')].material as Material).uuid,
			(await lambert1.material()).uuid,
			'not assigned'
		);
		assert.equal(
			(objects1[objectNames.indexOf('SheenChair_fabric')].material as Material).uuid,
			(await lambert1.material()).uuid,
			'assigned'
		);

		material1.p.group.set('SheenChair_metal');
		const objects2 = await getObjects();
		assert.notEqual(
			(objects1[objectNames.indexOf('SheenChair_label')].material as Material).uuid,
			(await lambert1.material()).uuid
		);
		assert.equal(
			(objects2[objectNames.indexOf('SheenChair_metal')].material as Material).uuid,
			(await lambert1.material()).uuid
		);
	});

	qUnit.test('sop/material access group by object index', async (assert) => {
		const geo1 = window.geo1;
		const MAT = window.MAT;

		const file1 = geo1.createNode('fileGLTF');
		file1.p.url.set(`${ASSETS_ROOT}/models/SheenChair.glb`);
		const hierarchy1 = geo1.createNode('hierarchy');
		hierarchy1.setMode(HierarchyMode.REMOVE_PARENT);
		hierarchy1.setInput(0, file1);
		const lambert1 = MAT.createNode('meshLambert');
		const material1 = geo1.createNode('material');
		material1.p.material.setNode(lambert1);
		material1.setInput(0, hierarchy1);

		const container1 = await hierarchy1.compute();
		const coreContent = container1.coreContent()!;
		const objects = coreContent.allObjects();
		assert.equal(objects.length, 4);
		const objectNames = objects.map((o: ObjectContent<CoreObjectType>) => o.name);
		const objectNamesSorted = [...objectNames].sort();
		assert.deepEqual(
			objectNamesSorted.sort(),
			['SheenChair_metal', 'SheenChair_wood', 'SheenChair_label', 'SheenChair_fabric'].sort()
		);

		async function getObjects() {
			const container1 = await material1.compute();
			const coreContent = container1.coreContent()!;
			const objects = coreContent.allObjects();
			return objects as Mesh[];
		}

		material1.p.group.set('@objnum=3');
		const objects1 = await getObjects();
		assert.notEqual((objects1[0].material as Material).uuid, (await lambert1.material()).uuid, 'not assigned');
		assert.equal((objects1[3].material as Material).uuid, (await lambert1.material()).uuid, 'assigned');

		material1.p.group.set('@objnum=0');
		const objects2 = await getObjects();
		assert.notEqual((objects2[3].material as Material).uuid, (await lambert1.material()).uuid, 'not assigned');
		assert.equal((objects2[0].material as Material).uuid, (await lambert1.material()).uuid, 'assigned');
	});

	qUnit.test('sop/material access group by hierarchy mask', async (assert) => {
		const geo1 = window.geo1;
		const MAT = window.MAT;

		const file1 = geo1.createNode('fileGLTF');
		file1.p.url.set(`${ASSETS_ROOT}/models/SheenChair.glb`);
		const lambert1 = MAT.createNode('meshLambert');
		const material1 = geo1.createNode('material');
		material1.p.material.setNode(lambert1);
		material1.setInput(0, file1);

		// const container1 = await file1.compute();
		// const coreContent = container1.coreContent()!;
		// const coreObjects = coreContent.coreObjects();
		// for (let co of coreObjects) {
		// 	const o = co.object();
		// 	o.traverse((child: Object3D) => {
		// 		console.log(CorePath.objectPath(child, o));
		// 	});
		// }
		// const objects = coreContent.objects()[0].children;
		// assert.equal(objects.length, 4);
		// const objectNames = objects.map((o: Object3D) => o.name);
		// const objectNamesSorted = [...objectNames].sort();
		// assert.deepEqual(
		// 	objectNamesSorted.sort(),
		// 	['SheenChair_metal', 'SheenChair_wood', 'SheenChair_label', 'SheenChair_fabric'].sort()
		// );

		async function getObjects() {
			const container1 = await material1.compute();
			const coreContent = container1.coreContent()!;
			const objects = coreContent.threejsObjects()[0].children;
			return objects as Mesh[];
		}
		const mat = await lambert1.material();
		const matUuid = mat.uuid;
		async function objectNamesWithMaterial() {
			const objects1 = await getObjects();
			return objects1
				.filter((o: Mesh) => (o.material as Material).uuid == matUuid)
				.map((o: Object3D) => o.name)
				.sort();
		}
		async function objectNamesWithoutMaterial() {
			const objects1 = await getObjects();
			return objects1
				.filter((o: Mesh) => (o.material as Material).uuid != matUuid)
				.map((o: Object3D) => o.name)
				.sort();
		}

		material1.p.group.set('*/SheenChair_wood');
		assert.deepEqual(await objectNamesWithMaterial(), ['SheenChair_wood'].sort());
		assert.deepEqual(
			await objectNamesWithoutMaterial(),
			['SheenChair_fabric', 'SheenChair_label', 'SheenChair_metal'].sort()
		);

		material1.p.group.set('*SheenChair_label');
		assert.deepEqual(await objectNamesWithMaterial(), ['SheenChair_label'].sort());
		assert.deepEqual(
			await objectNamesWithoutMaterial(),
			['SheenChair_fabric', 'SheenChair_wood', 'SheenChair_metal'].sort()
		);

		material1.p.group.set('*/Sheen*_wood');
		assert.deepEqual(await objectNamesWithMaterial(), ['SheenChair_wood'].sort());
		assert.deepEqual(
			await objectNamesWithoutMaterial(),
			['SheenChair_fabric', 'SheenChair_label', 'SheenChair_metal'].sort()
		);
	});

	qUnit.test('sop/material applies to children correctly', async (assert) => {
		const geo1 = window.geo1;
		const MAT = window.MAT;
		const fileGLTF1 = geo1.createNode('fileGLTF');
		const material1 = geo1.createNode('material');

		const basicMesh = MAT.createNode('meshBasic');
		const matUuid = (await basicMesh.material()).uuid;
		material1.setInput(0, fileGLTF1);
		material1.p.material.setNode(basicMesh);
		material1.p.group.set('*');

		const container = await material1.compute();
		const objects = container.coreContent()!.allObjects();
		assert.ok(objects);

		let anyWithAdifferentMat = false;
		for (let object of objects) {
			object.traverse((child: ObjectContent<CoreObjectType>) => {
				const childMat = (child as Mesh).material;
				if (childMat) {
					if (CoreType.isArray(childMat)) {
						for (let childSubMAt of childMat) {
							if (childSubMAt.uuid != matUuid) {
								anyWithAdifferentMat = true;
							}
						}
					} else {
						if (childMat.uuid != matUuid) {
							anyWithAdifferentMat = true;
						}
					}
				}
			});
		}
		assert.notOk(anyWithAdifferentMat);
	});

	qUnit.test('sop/material clone preserves builder onBeforeCompile', async (assert) => {
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
			const objects = container.coreContent()!.allObjects() as Mesh[];
			assert.equal(objects.length, 2);
			const srcMaterial = await meshLambertBuilder1.material();
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
			assert.equal(
				(srcMaterial.customMaterials[CustomMaterialName.DEPTH] as ShaderMaterial).vertexShader,
				(
					(materialObject0 as MaterialWithCustomMaterials).customMaterials[
						CustomMaterialName.DEPTH
					] as ShaderMaterial
				).vertexShader,
				'depth'
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
}
