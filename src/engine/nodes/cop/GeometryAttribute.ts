/**
 * Reads an attribute from a geometry and fills a texture with the values.
 *
 * @remarks
 *
 * This can be used to lookup geometry attributes inside a shader.
 *
 *
 */
import {TypedCopNode} from './_Base';
import {BufferGeometry, DataTexture, Mesh, Texture} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
import {CoreMask} from '../../../core/geometry/Mask';
import {
	textureFromAttributes,
	// textureFromAttributesMissingAttributes,
	textureFromAttributesTotalAttribSizes,
} from '../../../core/geometry/operation/TextureFromAttribute';
import {CoreAttribute} from '../../../core/geometry/Attribute';
import {CoreGeometry} from '../../../core/geometry/Geometry';

class GeometryAttributeCopParamsConfig extends NodeParamsConfig {
	/** @param sop node */
	node = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.SOP,
		},
	});
	/** @param group to read the material from */
	group = ParamConfig.STRING('', {
		objectMask: true,
	});
	/** @param attribute name */
	attribute = ParamConfig.STRING('P');
}
const ParamsConfig = new GeometryAttributeCopParamsConfig();

export class GeometryAttributeCopNode extends TypedCopNode<GeometryAttributeCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): 'geometryAttribute' {
		return 'geometryAttribute';
	}

	override async cook() {
		const geometryNode = this.pv.node.nodeWithContext(NodeContext.SOP, this.states.error);
		if (!geometryNode) {
			this.states.error.set(`node not found at path '${this.pv.node.path()}'`);
			return;
		}
		const container = await geometryNode.compute();
		const coreGroup = container.coreContent();
		if (!coreGroup) {
			this.states.error.set(`geometry invalid`);
			return;
		}
		const selectedObjects = CoreMask.filterObjects(coreGroup, this.pv);
		if (selectedObjects.length == 0) {
			this.states.error.set(`no object matching group`);
			return;
		}
		let texture: Texture | undefined;
		for (const selectedObject of selectedObjects) {
			const geometry = (selectedObject as Mesh).geometry;
			if (geometry) {
				texture = texture || this._textureFromGeometry(geometry);
			}
		}
		if (!texture) {
			this.cookController.endCook();
			return;
		}
		this.setTexture(texture);
	}
	private _textureFromGeometry(geometry: BufferGeometry): DataTexture | undefined {
		const geoAttribNames = CoreGeometry.attribNames(geometry);
		const attribNames = CoreAttribute.attribNamesMatchingMask(this.pv.attribute, geoAttribNames);

		// the missing attributes is currently not working, since we use a mask check first
		// const missingAttributes = textureFromAttributesMissingAttributes(geometry, attribNames);
		// if (missingAttributes.length > 0) {
		// 	this.states.error.set(`missing attributes: ${missingAttributes.join(',')}`);
		// 	return;
		// }
		const totalSize = textureFromAttributesTotalAttribSizes(geometry, attribNames);
		if (totalSize > 4) {
			this.states.error.set(`total size of attributes is ${totalSize}, but maximum is 4`);
			return;
		}

		return textureFromAttributes(geometry, attribNames);
		// const position = geometry.attributes.position;
		// if (!(position instanceof BufferAttribute)) {
		// 	this.states.error.set('position is not a BufferAttribute');
		// 	return;
		// }
		// const pointsCount = position.count;
		// const attributeName = CoreAttribute.remapName(this.pv.attribute);
		// const attribute = geometry.getAttribute(attributeName) as BufferAttribute;
		// if (!attribute) {
		// 	this.states.error.set(`attribute '${attributeName}' not found`);
		// 	return;
		// }
		// const attribSize = attribute.itemSize;
		// textureFromAttributeSize(geometry, textureSize);

		// const width = textureSize.x;
		// const height = textureSize.y;

		// const size = width * height * 4;
		// const pixelBuffer = new Float32Array(size);

		// const attribArray = attribute.array as number[];
		// if (attribSize == 1) {
		// 	for (let i = 0; i < pointsCount; i++) {
		// 		pixelBuffer[i * 4] = attribArray[i];
		// 	}
		// } else {
		// 	const vector = _vectorFromAttribSize(attribSize);
		// 	if (!vector) {
		// 		return;
		// 	}
		// 	for (let i = 0; i < pointsCount; i++) {
		// 		vector.fromArray(attribArray, i * attribSize);
		// 		vector.toArray(pixelBuffer, i * 4);
		// 	}
		// }
		// const texture = new DataTexture(pixelBuffer, width, height, RGBAFormat, FloatType);
		// texture.minFilter = texture.magFilter = NearestFilter;
		// texture.wrapS = texture.wrapT = RepeatWrapping;
		// texture.needsUpdate = true;
		// return texture;
	}
}
