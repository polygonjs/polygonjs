import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Mesh} from 'three/src/objects/Mesh';
import {Texture} from 'three/src/textures/Texture';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {CoreType} from '../../../core/Type';
interface TextureCopySopParams extends DefaultOperationParams {
	textureName: string;
}

export class TextureCopySopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: TextureCopySopParams = {
		textureName: 'map',
	};
	static readonly INPUT_CLONED_STATE = [InputCloneMode.FROM_NODE, InputCloneMode.NEVER];
	static type(): Readonly<'TextureCopy'> {
		return 'TextureCopy';
	}

	async cook(inputContents: CoreGroup[], params: TextureCopySopParams) {
		const coreGroupTarget = inputContents[0];
		const coreGroupSrc = inputContents[1];

		let texture: Texture | undefined;
		for (let object of coreGroupSrc.objects() as Mesh[]) {
			object.traverse((child) => {
				const mat = (child as Mesh).material;
				if (mat) {
					if (!CoreType.isArray(mat)) {
						if (!texture) {
							texture = (mat as any)[params.textureName] as Texture;
						}
					}
				}
			});
		}
		if (texture) {
			for (let object of coreGroupTarget.objects() as Mesh[]) {
				object.traverse((child) => {
					const mat = (child as Mesh).material;
					if (mat) {
						if (!CoreType.isArray(mat)) {
							(mat as any)[params.textureName] = texture;
							const uniforms = (mat as ShaderMaterial).uniforms;
							if (uniforms) {
								const uniform = uniforms[params.textureName];
								if (uniform) {
									uniform.value = texture;
								}
							}
							mat.needsUpdate = true;
						}
					}
				});
			}
		}

		return coreGroupTarget;
	}
}
