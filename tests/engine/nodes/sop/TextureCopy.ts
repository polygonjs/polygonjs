import {Mesh} from 'three';
import {Texture} from 'three';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {BaseSopNodeType} from '../../../../src/engine/nodes/sop/_Base';

async function findTexture(node: BaseSopNodeType, textureName: string) {
	const container = await node.compute();
	const coreGroup = container.coreContent()!;
	let texture: Texture | undefined;
	for (let object of coreGroup.objects() as Mesh[]) {
		object.traverse((child) => {
			const mat = (child as Mesh).material;
			if (mat) {
				texture = (mat as any)[textureName];
			}
		});
	}
	return texture;
}

QUnit.test('textureCopy simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false);
	const file1 = geo1.createNode('file');
	const sphere1 = geo1.createNode('sphere');
	const textureCopy1 = geo1.createNode('textureCopy');
	file1.p.url.set(`${ASSETS_ROOT}/models/sphere_with_texture.glb`);

	textureCopy1.setInput(0, sphere1);
	textureCopy1.setInput(1, file1);

	const textureName = 'map';
	const fileTexture = (await findTexture(file1, textureName))!;
	const copiedTexture = (await findTexture(textureCopy1, textureName))!;

	assert.ok(fileTexture);
	assert.ok(copiedTexture);
	assert.equal(fileTexture.uuid, copiedTexture.uuid);

	assert.equal(copiedTexture.image.width, 2048);
	assert.equal(copiedTexture.image.height, 2048);
});
