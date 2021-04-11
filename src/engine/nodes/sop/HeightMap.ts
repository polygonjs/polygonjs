/**
 * Creates a heightmap
 *
 *
 */
import {DataTexture} from 'three/src/textures/DataTexture';
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
import {CoreGroup} from '../../../core/geometry/Group';
import {BaseCopNodeType} from '../cop/_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreObject} from '../../../core/geometry/Object';
import {Texture} from 'three/src/textures/Texture';
import {CoreImage} from '../../../core/Image';
import {NODE_PATH_DEFAULT} from '../../../core/Walker';
class HeightMapSopParamsConfig extends NodeParamsConfig {
	/** @param texture node to load the heightmap from */
	texture = ParamConfig.OPERATOR_PATH(NODE_PATH_DEFAULT.NODE.UV, {
		nodeSelection: {context: NodeContext.COP},
	});
	/** @param values multiplier */
	mult = ParamConfig.FLOAT(1);
}
const ParamsConfig = new HeightMapSopParamsConfig();

export class HeightMapSopNode extends TypedSopNode<HeightMapSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'heightMap';
	}

	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	async cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];

		const node = this.p.texture.found_node();
		if (node) {
			const node_context = node.context();
			if (node_context == NodeContext.COP) {
				const texture_node = node as BaseCopNodeType;
				const container = await texture_node.compute();
				const texture = container.texture();

				for (let core_object of core_group.coreObjects()) {
					this._set_position_from_data_texture(core_object, texture);
				}
			} else {
				this.states.error.set('found node is not a texture');
			}
		}
		core_group.computeVertexNormals();
		this.setCoreGroup(core_group);
	}

	private _set_position_from_data_texture(core_object: CoreObject, texture: Texture) {
		const texture_data = this._data_from_texture(texture);
		if (!texture_data) {
			return;
		}
		const {data, resx, resy} = texture_data;
		const texture_component_size = data.length / (resx * resy);

		const geometry = core_object.coreGeometry()?.geometry();
		if (!geometry) {
			return;
		}

		const positions = geometry.getAttribute('position').array as number[];
		const uv_attrib = geometry.getAttribute('uv');
		const normal_attrib = geometry.getAttribute('normal');

		if (uv_attrib == null) {
			this.states.error.set('uvs are required');
			return;
		}
		if (normal_attrib == null) {
			this.states.error.set('normals are required');
			return;
		}
		const uvs = uv_attrib.array;
		const normals = normal_attrib.array;

		const points_count = positions.length / 3;
		let uv_stride, uvx, uvy, x, y, j, val;
		let index: number = 0;
		for (let i = 0; i < points_count; i++) {
			uv_stride = i * 2;
			uvx = uvs[uv_stride];
			uvy = uvs[uv_stride + 1];
			x = Math.floor((resx - 1) * uvx);
			y = Math.floor((resy - 1) * (1 - uvy));
			j = y * resx + x;
			val = data[texture_component_size * j];

			index = i * 3;
			positions[index + 0] += normals[index + 0] * val * this.pv.mult;
			positions[index + 1] += normals[index + 1] * val * this.pv.mult;
			positions[index + 2] += normals[index + 2] * val * this.pv.mult;
		}
	}

	private _data_from_texture(texture: Texture) {
		if (texture.image) {
			if (texture.image.data) {
				return this._data_from_data_texture(texture as DataTexture);
			}
			return this._data_from_default_texture(texture);
		}
	}
	private _data_from_default_texture(texture: Texture) {
		const resx = texture.image.width;
		const resy = texture.image.height;
		const image_data = CoreImage.data_from_image(texture.image);
		const data = image_data.data;
		return {
			data,
			resx,
			resy,
		};
	}
	private _data_from_data_texture(texture: DataTexture) {
		const data = texture.image.data;
		const resx = texture.image.width;
		const resy = texture.image.height;
		return {
			data,
			resx,
			resy,
		};
	}
}
