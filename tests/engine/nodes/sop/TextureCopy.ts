import {Mesh} from 'three/src/objects/Mesh';
import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';
import {Texture} from 'three/src/textures/Texture';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';

QUnit.test('textureCopy simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false);
	const file1 = geo1.createNode('file');
	const sphere1 = geo1.createNode('sphere');
	const textureCopy1 = geo1.createNode('textureCopy');
	file1.p.url.set(`${ASSETS_ROOT}/models/sphere_with_texture.glb`);

	textureCopy1.setInput(0, sphere1);
	textureCopy1.setInput(1, file1);

	const container = await textureCopy1.compute();
	const coreGroup = container.coreContent()!;
	const texture = ((coreGroup.objects()[0] as Mesh).material as MeshBasicMaterial).map as Texture;

	assert.equal(texture.image.width, 2048);
	assert.equal(texture.image.height, 2048);
});
