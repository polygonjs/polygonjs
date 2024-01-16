import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Mesh} from 'three';
import {Texture} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {ShaderMaterial} from 'three';
import {isArray} from '../../../core/Type';
import {DefaultOperationParams} from '../../../core/operations/_Base';
interface TextureCopySopParams extends DefaultOperationParams {
	textureName: string;
}

export class TextureCopySopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: TextureCopySopParams = {
		textureName: 'map',
	};
	static override readonly INPUT_CLONED_STATE = [InputCloneMode.FROM_NODE, InputCloneMode.NEVER];
	static override type(): Readonly<'TextureCopy'> {
		return 'TextureCopy';
	}

	override async cook(inputContents: CoreGroup[], params: TextureCopySopParams) {
		const coreGroupTarget = inputContents[0];
		const coreGroupSrc = inputContents[1];

		let texture: Texture | undefined;
		const srcObjects = coreGroupSrc.allObjects();
		for (let object of srcObjects) {
			object.traverse((child) => {
				const mat = child.material;
				if (mat) {
					if (!isArray(mat)) {
						if (!texture) {
							texture = (mat as any)[params.textureName] as Texture;
						}
					}
				}
			});
		}
		if (texture) {
			const targetObjects = coreGroupTarget.allObjects();
			for (let object of targetObjects) {
				object.traverse((child) => {
					const mat = (child as Mesh).material;
					if (mat) {
						if (!isArray(mat)) {
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
