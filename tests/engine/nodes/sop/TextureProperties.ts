import {Mesh} from 'three/src/objects/Mesh';
import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';
import {Texture} from 'three/src/textures/Texture';
import {CoreTextureLoader} from '../../../../src/core/loader/Texture';

QUnit.test('texture_properties simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false);
	const COP = window.COP;
	const MAT = window.MAT;
	const file1 = COP.create_node('image');
	const basic_material1 = MAT.create_node('mesh_basic');
	const plane1 = geo1.create_node('plane');
	const material1 = geo1.create_node('material');

	// setup scene
	file1.p.url.set(CoreTextureLoader.PARAM_DEFAULT);
	file1.p.tanisotropy.set(0);
	basic_material1.p.use_map.set(1);
	await file1.request_container();
	basic_material1.p.map.set(file1.full_path());
	material1.p.material.set(basic_material1.full_path());
	material1.set_input(0, plane1);

	let container = await material1.request_container();
	let core_group = container.core_content()!;
	let texture = ((core_group.objects()[0] as Mesh).material as MeshBasicMaterial).map as Texture;
	assert.equal(texture.anisotropy, 1);

	// test
	const texture_properties1 = geo1.create_node('texture_properties');
	texture_properties1.set_input(0, material1);

	container = await texture_properties1.request_container();
	core_group = container.core_content()!;
	texture = ((core_group.objects()[0] as Mesh).material as MeshBasicMaterial).map as Texture;
	assert.equal(texture.anisotropy, 1);

	texture_properties1.p.tanisotropy.set(1);
	texture_properties1.p.use_renderer_max_anisotropy.set(0);
	texture_properties1.p.anisotropy.set(8);
	container = await texture_properties1.request_container();
	core_group = container.core_content()!;
	texture = ((core_group.objects()[0] as Mesh).material as MeshBasicMaterial).map as Texture;
	assert.equal(texture.anisotropy, 8);
});
