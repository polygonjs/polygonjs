/**
 * Creates an SDF texture which can be used inside the [mat/raymarchingBuilder](/doc/nodes/mat/raymarchingBuilder)
 *
 *
 */
import {MeshWithBVH} from './../../operations/sop/utils/Bvh/three-mesh-bvh';
import {Vector3, Ray, Texture, Data3DTexture, DoubleSide} from 'three';
import {NodeContext} from './../../poly/NodeContext';
import {TypedCopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {HitPointInfo} from 'three-mesh-bvh';
import {createSDFTexture} from '../../../core/loader/geometry/SDF';

const rayDir = new Vector3();
const ray = new Ray();
class SDFFromObjectCopParamsConfig extends NodeParamsConfig {
	/** @param texture resolution */
	resolution = ParamConfig.INTEGER(16, {
		range: [4, 256],
		rangeLocked: [true, false],
	});
	/** @param which SOP node to import from */
	geometry = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.SOP,
		},
	});
	/** @param force Render */
	render = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			SDFFromObjectCopNode.PARAM_CALLBACK_render(node as SDFFromObjectCopNode);
		},
	});
}

const ParamsConfig = new SDFFromObjectCopParamsConfig();

export class SDFFromObjectCopNode extends TypedCopNode<SDFFromObjectCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFFromObject';
	}

	override async cook(inputContents: Texture[]) {
		this.createTextureTargetIfRequired();

		const geometryNode = this.pv.geometry.nodeWithContext(NodeContext.SOP, this.states.error);
		if (!geometryNode) {
			this.states.error.set(`node not found at path '${this.pv.geometry}'`);
			return;
		}
		const container = await geometryNode.compute();
		const object = container.coreContent()?.objects()[0];
		if (!object) {
			this.states.error.set(`no objects found in given geometry`);
			return;
		}

		const geometry = (object as MeshWithBVH).geometry;
		if (!geometry) {
			this.states.error.set(`no geometry found in given geometry`);
			return;
		}
		const boundsTree = geometry.boundsTree;
		if (!boundsTree) {
			this.states.error.set(`no BVH found in given geometry`);
			return;
		}

		this._fillTexture(object as MeshWithBVH);

		if (this._dataTexture) {
			this.setTexture(this._dataTexture());
		} else {
			this.cookController.endCook();
		}
	}

	/*
	 *
	 * FILL TEXTURE
	 *
	 */
	_fillTexture(object: MeshWithBVH) {
		const boundsTree = object.geometry.boundsTree;

		const texture = this._dataTexture();
		const {resolution} = this.pv;
		const data = texture.image.data as Float32Array;
		const pos = new Vector3();
		const distanceResult: HitPointInfo = {
			point: new Vector3(),
			distance: -1,
			faceIndex: -1,
		};

		let i = 0;
		for (let x = 0; x < resolution; x++) {
			for (let y = 0; y < resolution; y++) {
				for (let z = 0; z < resolution; z++) {
					pos.set(x, y, z).divideScalar(resolution);
					// const d = v.length() - radius;
					// const d = (y - halfRes) / resolution; // plane
					// const xd = (x - halfRes) / resolution - radius;
					// const yd = (y - halfRes) / resolution - radius;
					// const zd = (z - halfRes) / resolution - radius;
					// const x2 = xd * xd;
					// const y2 = yd * yd;
					// const z2 = zd * zd;
					// const d = Math.sqrt(x2 + y2 + z2);
					boundsTree.closestPointToPoint(pos, distanceResult);
					// check if we are inside
					rayDir.copy(distanceResult.point).sub(pos);
					ray.origin.copy(pos);
					const res = boundsTree.raycastFirst(ray, DoubleSide);
					const inside = res && res.face && res.face.normal.dot(ray.direction) > 0.0;

					const d = distanceResult.distance;
					data[i] = inside ? -d : d;
					i++;
				}
			}
		}
	}

	/*
	 *
	 * CREATE TEXTURE
	 *
	 */
	private __dataTexture: Data3DTexture | undefined;
	private _resolutionUsed: number = -1;
	_dataTexture() {
		return (this.__dataTexture = this.__dataTexture || this._createTexture(this.pv.resolution));
	}
	private createTextureTargetIfRequired() {
		const {resolution} = this.pv;
		if (!this.__dataTexture || !this._textureResolutionValid(resolution)) {
			this.__dataTexture = this._createTexture(resolution);
			this._resolutionUsed = resolution;
		}
	}
	private _textureResolutionValid(resolution: number) {
		if (this.__dataTexture) {
			if (resolution != this._resolutionUsed) {
				return false;
			} else {
				return true;
			}
		} else {
			return false;
		}
	}

	private _createTexture(resolution: number) {
		return createSDFTexture(resolution, resolution, resolution);
	}

	/*
	 *
	 * CALLBACK
	 *
	 */
	static PARAM_CALLBACK_render(node: SDFFromObjectCopNode) {
		node.setDirty();
	}
}
