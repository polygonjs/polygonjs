/**
 * Creates a heightmap
 *
 *
 */
import {BufferAttribute, DataTexture} from 'three';
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
import {CoreGroup} from '../../../core/geometry/Group';
import {BaseCopNodeType} from '../cop/_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Texture} from 'three';
import {CoreImage} from '../../../core/Image';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
import {Attribute} from '../../../core/geometry/Attribute';
import {corePointClassFactory} from '../../../core/geometry/CoreObjectFactory';
class HeightMapSopParamsConfig extends NodeParamsConfig {
	/** @param texture node to load the heightmap from */
	texture = ParamConfig.NODE_PATH('', {
		nodeSelection: {context: NodeContext.COP},
	});
	/** @param values multiplier */
	mult = ParamConfig.FLOAT(1);
}
const ParamsConfig = new HeightMapSopParamsConfig();

export class HeightMapSopNode extends TypedSopNode<HeightMapSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'heightMap';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];

		const node = this.pv.texture.nodeWithContext(NodeContext.COP, this.states.error);
		if (node) {
			const node_context = node.context();
			if (node_context == NodeContext.COP) {
				const texture_node = node as BaseCopNodeType;
				const container = await texture_node.compute();
				const texture = container.texture();

				const objects = coreGroup.allObjects();
				for (const object of objects) {
					this._setPositionFromDataTexture(object, texture);
				}
			} else {
				this.states.error.set('found node is not a texture');
			}
		}
		// core_group.computeVertexNormals();
		const objects = coreGroup.threejsObjectsWithGeo();
		for (const object of objects) {
			object.geometry.computeVertexNormals();
		}
		this.setCoreGroup(coreGroup);
	}

	private _setPositionFromDataTexture<T extends CoreObjectType>(object: ObjectContent<T>, texture: Texture) {
		const textureData = this._dataFromTexture(texture);
		if (!textureData) {
			return;
		}
		const {data, resx, resy} = textureData;
		const texture_component_size = data.length / (resx * resy);

		// const geometry = core_object.coreGeometry()?.geometry();
		// if (!geometry) {
		// 	return;
		// }
		const corePointClass = corePointClassFactory(object);

		const positions = (corePointClass.attribute(object, Attribute.POSITION) as BufferAttribute).array as number[];
		const uvAttrib = corePointClass.attribute(object, Attribute.UV) as BufferAttribute;
		const normalAttrib = corePointClass.attribute(object, Attribute.NORMAL) as BufferAttribute;

		if (uvAttrib == null) {
			this.states.error.set('uvs are required');
			return;
		}
		if (normalAttrib == null) {
			this.states.error.set('normals are required');
			return;
		}
		const uvs = uvAttrib.array;
		const normals = normalAttrib.array;

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

	private _dataFromTexture(texture: Texture) {
		if (texture.image) {
			if (texture.image.data) {
				return this._dataFromDataTexture(texture as DataTexture);
			}
			return this._dataFromDefaultTexture(texture);
		}
	}
	private _dataFromDefaultTexture(texture: Texture) {
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
	private _dataFromDataTexture(texture: DataTexture) {
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
