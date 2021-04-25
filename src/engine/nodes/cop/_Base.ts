import {TypedNode} from '../_Base';
import {Texture} from 'three/src/textures/Texture';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
import {PolyScene} from '../../scene/PolyScene';
import {FlagsControllerBO} from '../utils/FlagsController';
import {DataTexture} from 'three/src/textures/DataTexture';
import {LuminanceFormat, HalfFloatType} from 'three/src/constants';

const INPUT_COP_NAME = 'input texture';
const DEFAULT_INPUT_NAMES = [INPUT_COP_NAME, INPUT_COP_NAME, INPUT_COP_NAME, INPUT_COP_NAME];

var size = 32;
var data = new Uint16Array(size);
for (var i = 0; i < size; i++) {
	data[i] = 0x70e2; // Half float 10000
}
const EMPTY_DATA_TEXTURE = new DataTexture(data, size, 1, LuminanceFormat, HalfFloatType);

export class TypedCopNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.COP, K> {
	public readonly flags: FlagsControllerBO = new FlagsControllerBO(this);

	static context(): NodeContext {
		return NodeContext.COP;
	}
	static displayedInputNames(): string[] {
		return DEFAULT_INPUT_NAMES;
	}

	constructor(scene: PolyScene) {
		super(scene, 'BaseCopNode');
	}

	initializeBaseNode() {
		this.io.outputs.setHasOneOutput();
	}

	setTexture(texture: Texture) {
		texture.name = this.path();

		const currentTexture = this.containerController.container().texture();
		if (currentTexture) {
			// this method to change the texture of a cop/image
			// and have the material update could potentially work.
			// But at the moment, when loading a 2nd texture,
			// This overrides the properties of the 1st texture.
			// So that when we try and reload that 1st texture, it has become the 2nd.
			// And even with more texture, the behavior still seems to keep the 2nd texture
			if (currentTexture.uuid != texture.uuid) {
				const newPropNames = Object.keys(texture) as Array<keyof Texture>;
				for (let newPropName of newPropNames) {
					(currentTexture as any)[newPropName] = texture[newPropName];
				}
				// document.body.append((currentTexture as any).image);
				// document.body.style.overflow = 'auto';
				currentTexture.needsUpdate = true;
			}
			this._setContainer(currentTexture);
		} else {
			this._setContainer(texture);
		}
		// this._copy_texture(texture);
	}
	protected _clearTexture() {
		this._setContainer(EMPTY_DATA_TEXTURE);
	}
	// this methods leads to webgl errors quite deep in threejs renderer
	// private _copytexture(texture: Texture, target: Texture) {
	// 	const newPropNames = Object.keys(texture) as Array<keyof Texture>;
	// 	for (let newPropName of newPropNames) {
	// 		(target as any)[newPropName] = texture[newPropName];
	// 		console.log('prop', newPropName);
	// 	}
	// 	target.needsUpdate = true;
	// }
}

export type BaseCopNodeType = TypedCopNode<any>;
export class BaseCopNodeClass extends TypedCopNode<any> {}
