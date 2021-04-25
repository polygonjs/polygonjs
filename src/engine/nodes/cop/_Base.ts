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
		console.log('set texture', this.path(), texture);
		// this._copy_texture(texture);
		texture.name = this.path();
		this._setContainer(texture);
	}
	protected _clearTexture() {
		this._setContainer(EMPTY_DATA_TEXTURE);
	}
}

export type BaseCopNodeType = TypedCopNode<any>;
export class BaseCopNodeClass extends TypedCopNode<any> {}
