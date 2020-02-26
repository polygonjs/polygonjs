import {TypedNode} from '../_Base';
import {TextureContainer} from '../../containers/Texture';
import {Texture} from 'three/src/textures/Texture';
import {TypedContainerController} from '../utils/ContainerController';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
import {PolyScene} from '../../scene/PolyScene';
import {FlagsControllerB} from '../utils/FlagsController';
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

export class TypedCopNode<K extends NodeParamsConfig> extends TypedNode<'TEXTURE', BaseCopNodeType, K> {
	container_controller: TypedContainerController<TextureContainer> = new TypedContainerController<TextureContainer>(
		this,
		TextureContainer
	);
	public readonly flags: FlagsControllerB = new FlagsControllerB(this);
	// private _typed_array = new Uint8ClampedArray(512 * 512 * 4);
	// protected _texture: Texture = new DataTexture(this._typed_array, 512, 512, RGBFormat);
	// get texture() {
	// 	return this._data_texture;
	// }

	static node_context(): NodeContext {
		return NodeContext.COP;
	}
	static displayed_input_names(): string[] {
		return DEFAULT_INPUT_NAMES;
	}

	constructor(scene: PolyScene) {
		super(scene, 'BaseCopNode');
	}

	initialize_base_node() {
		// this.flags.add_bypass();

		// this.flags.add_display();
		// if (this.flags.display) {
		// 	this.flags.display.set(false);
		// }
		this.io.outputs.set_has_one_output();
		// this.container_controller.init(CONTAINER_CLASS);
	}

	set_texture(texture: Texture) {
		// this._copy_texture(texture);
		texture.name = this.full_path();
		this.set_container(texture);
	}
	clear_texture() {
		this.set_container(EMPTY_DATA_TEXTURE);
	}

	// private _copy_texture(texture: Texture) {
	// 	console.log('_copy_texture', texture);
	// 	if (texture instanceof DataTexture) {
	// 		this._data_texture.image = texture.image;
	// 	} else {
	// 		const canvas = document.createElement('canvas');
	// 		// document.body.appendChild(canvas);
	// 		const width = texture.image.width;
	// 		const height = texture.image.height;
	// 		canvas.width = width;
	// 		canvas.height = height;
	// 		const context = canvas.getContext('2d') as CanvasRenderingContext2D;
	// 		context.drawImage(texture.image, 0, 0);
	// 		const image_data = context.getImageData(0, 0, width, height);
	// 		console.log(this._typed_array.length, image_data.data.length, image_data);
	// 		this._data_texture.image = image_data;
	// 	}
	// 	this._data_texture.format = texture.format;
	// 	// this._data_texture.mapping = texture.mapping;
	// 	// this._data_texture.wrapS = texture.wrapS;
	// 	// this._data_texture.wrapT = texture.wrapT;
	// 	// this._data_texture.minFilter = texture.minFilter;
	// 	// this._data_texture.magFilter = texture.magFilter;
	// 	this._data_texture.needsUpdate = true;
	// 	console.log('updated data tex', this._data_texture);

	// 	// if (!this._texture || this._texture.uuid != texture.uuid) {
	// 	// 	if (!this._texture) {
	// 	// 		console.log('assign');
	// 	// 		this._texture = texture.clone();
	// 	// 		// this._texture.name = this.full_path();
	// 	// 	} else {
	// 	// 		console.log('copy');
	// 	// 		const keys = Object.keys(texture) as Array<keyof Texture>;
	// 	// 		const protected_keys = ['uuid', 'name', 'node'];
	// 	// 		for (let key of keys) {
	// 	// 			if (!protected_keys.includes(key)) {
	// 	// 				this._texture[key] = texture[key] as never; // but why is 'never' needed?!
	// 	// 			}
	// 	// 		}
	// 	// 	}
	// 	// }
	// }
}

export type BaseCopNodeType = TypedCopNode<any>;
export class BaseCopNodeClass extends TypedCopNode<any> {}
