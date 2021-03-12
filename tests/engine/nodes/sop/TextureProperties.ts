import {Mesh} from 'three/src/objects/Mesh';
import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';
import {Texture} from 'three/src/textures/Texture';
import {CoreLoaderTexture} from '../../../../src/core/loader/Texture';

QUnit.test('texture_properties simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false);
	const COP = window.COP;
	const MAT = window.MAT;
	const file1 = COP.createNode('image');
	const basic_material1 = MAT.createNode('meshBasic');
	const plane1 = geo1.createNode('plane');
	const material1 = geo1.createNode('material');

	// setup scene
	file1.p.url.set(CoreLoaderTexture.PARAM_DEFAULT);
	file1.p.tanisotropy.set(0);
	basic_material1.p.useMap.set(1);
	await file1.requestContainer();
	basic_material1.p.map.set(file1.fullPath());
	material1.p.material.set(basic_material1.fullPath());
	material1.setInput(0, plane1);

	let container = await material1.requestContainer();
	let core_group = container.coreContent()!;
	let texture = ((core_group.objects()[0] as Mesh).material as MeshBasicMaterial).map as Texture;
	assert.equal(texture.anisotropy, 1);

	// test
	const texture_properties1 = geo1.createNode('textureProperties');
	texture_properties1.setInput(0, material1);

	container = await texture_properties1.requestContainer();
	core_group = container.coreContent()!;
	texture = ((core_group.objects()[0] as Mesh).material as MeshBasicMaterial).map as Texture;
	assert.equal(texture.anisotropy, 1);

	texture_properties1.p.tanisotropy.set(1);
	texture_properties1.p.useRendererMaxAnisotropy.set(0);
	texture_properties1.p.anisotropy.set(8);
	container = await texture_properties1.requestContainer();
	core_group = container.coreContent()!;
	texture = ((core_group.objects()[0] as Mesh).material as MeshBasicMaterial).map as Texture;
	assert.equal(texture.anisotropy, 8);
});
