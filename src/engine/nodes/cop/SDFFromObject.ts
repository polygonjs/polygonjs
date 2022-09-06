/**
 * Creates an SDF texture which can be used inside the [mat/raymarchingBuilder](/doc/nodes/mat/raymarchingBuilder)
 *
 *
 */
import {Matrix4, Quaternion} from 'three';
import {ThreeMeshBVHHelper} from './../../operations/sop/utils/Bvh/ThreeMeshBVHHelper';
import {MeshWithBVH} from './../../operations/sop/utils/Bvh/three-mesh-bvh';
import {Vector3, Ray, Texture, Data3DTexture, DoubleSide, Box3, Mesh} from 'three';
import {NodeContext} from './../../poly/NodeContext';
import {TypedCopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {BaseNodeType} from '../_Base';
import {HitPointInfo} from 'three-mesh-bvh';
import {addSDFMetadataToContainer, createSDFTexture} from '../../../core/loader/geometry/SDF';
import {CopType} from '../../poly/registers/nodes/types/Cop';

const _bbox = new Box3();
const _rayDir = new Vector3();
const _ray = new Ray();
const _bboxSize = new Vector3();
const _resolution = new Vector3();
const _voxelSizes = new Vector3();
const _padding = new Vector3();
const objectWorldMat = new Matrix4();
const objectWorldMatInverse = new Matrix4();
const t = new Vector3();
const q = new Quaternion();
const s = new Vector3();

interface FillTextureOptions {
	resolution: Vector3;
	bbox: Box3;
	bboxSize: Vector3;
	voxelSizes: Vector3;
}
class SDFFromObjectCopParamsConfig extends NodeParamsConfig {
	/** @param which SOP node to import from */
	geometry = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.SOP,
		},
	});
	/** @param voxelSize */
	voxelSize = ParamConfig.FLOAT(0.1, {
		range: [0.00001, 1],
		rangeLocked: [true, false],
	});
	/** @param padding */
	padding = ParamConfig.INTEGER(2, {
		range: [0, 5],
		rangeLocked: [true, false],
	});
	/** @param resolution */
	resolution = ParamConfig.VECTOR3([-1, -1, -1], {
		cook: false,
		editable: false,
		separatorBefore: true,
	});
	/** @param boundMin */
	boundMin = ParamConfig.VECTOR3([-1, -1, -1], {
		cook: false,
		editable: false,
	});
	/** @param boundMax */
	boundMax = ParamConfig.VECTOR3([1, 1, 1], {
		cook: false,
		editable: false,
	});
	/** @param voxelSizes */
	// voxelSizes = ParamConfig.VECTOR3([1, 1, 1], {
	// 	cook: false,
	// 	editable: false,
	// });
	/** @param force Render */
	// render = ParamConfig.BUTTON(null, {
	// 	callback: (node: BaseNodeType) => {
	// 		SDFFromObjectCopNode.PARAM_CALLBACK_render(node as SDFFromObjectCopNode);
	// 	},
	// });
}

const ParamsConfig = new SDFFromObjectCopParamsConfig();

export class SDFFromObjectCopNode extends TypedCopNode<SDFFromObjectCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return CopType.SDF_FROM_OBJECT;
	}

	override async cook(inputContents: Texture[]) {
		const geometryNode = this.pv.geometry.nodeWithContext(NodeContext.SOP, this.states.error);
		if (!geometryNode) {
			this.states.error.set(`node not found at path '${this.pv.geometry}'`);
			return;
		}
		const container = await geometryNode.compute();
		const coreGroup = container.coreContent();

		const objects = coreGroup?.objects();
		if (!(coreGroup && objects && objects.length)) {
			this.states.error.set(`no objects found`);
			return;
		}

		let objectWithGeo: MeshWithBVH | undefined;
		for (let object of objects) {
			if ((object as MeshWithBVH).geometry) {
				objectWithGeo = objectWithGeo || (object as MeshWithBVH);
			}
		}
		if (!objectWithGeo) {
			for (let object of objects) {
				object.traverse((childObject) => {
					if ((childObject as MeshWithBVH).geometry) {
						objectWithGeo = objectWithGeo || (childObject as MeshWithBVH);
					}
				});
			}
		}
		if (!objectWithGeo) {
			this.states.error.set(`no object found with a geometry`);
			return;
		}
		const geometry = (objectWithGeo as MeshWithBVH).geometry;
		if (!geometry) {
			this.states.error.set(`no geometry found`);
			return;
		}
		let boundsTree = geometry.boundsTree;
		if (!boundsTree) {
			ThreeMeshBVHHelper.assignDefaultBVHIfNone(objectWithGeo as Mesh);
			boundsTree = geometry.boundsTree;
		}

		// update boundMin and BoundMax
		_bbox.copy(coreGroup.boundingBox());

		const _updateResolution = () => {
			_bbox.getSize(_bboxSize);
			_resolution.copy(_bboxSize).divideScalar(this.pv.voxelSize);
			_resolution.x = Math.ceil(_resolution.x * 0.5) * 2;
			_resolution.y = Math.ceil(_resolution.y * 0.5) * 2;
			_resolution.z = Math.ceil(_resolution.z * 0.5) * 2;
			_voxelSizes.copy(_bboxSize).divide(_resolution);
		};
		// compute resolution before padding
		_updateResolution();

		// expand the bounding box
		_padding.copy(_voxelSizes).multiplyScalar(this.pv.padding);
		_bbox.expandByVector(_padding);

		// recompute resolution after padding adjustment
		_updateResolution();

		// update params
		// _bbox.min.set(0, 0, 0);
		// _bbox.max.set(1, 1, 1);
		// _bboxSize.set(1, 1, 1);
		// _resolution.set(16, 16, 16);
		// _voxelSizes.copy(_bboxSize).divide(_resolution);
		this.p.boundMin.set(_bbox.min);
		this.p.boundMax.set(_bbox.max);
		this.p.resolution.set(_resolution);
		// this.p.voxelSizes.set(_voxelSizes);

		// write texture data
		const timeStart = performance.now();
		objectWithGeo.updateMatrixWorld(true);
		objectWorldMat.copy(objectWithGeo.matrixWorld);
		objectWorldMatInverse.copy(objectWithGeo.matrixWorld).invert();
		objectWorldMatInverse.decompose(t, q, s);
		this.createTextureTargetIfRequired(_resolution);
		const texture = this._fillTexture(objectWithGeo as MeshWithBVH, {
			resolution: _resolution,
			bbox: _bbox,
			bboxSize: _bboxSize,
			voxelSizes: _voxelSizes,
		});
		const totalTime = performance.now() - timeStart;
		console.log('SDF generation time', totalTime);

		if (texture) {
			this.setTexture(texture);
		} else {
			this.cookController.endCook();
		}
	}

	/*
	 *
	 * FILL TEXTURE
	 *
	 */
	_fillTexture(object: MeshWithBVH, options: FillTextureOptions) {
		const {resolution, bbox, bboxSize, voxelSizes} = options;
		const boundsTree = object.geometry.boundsTree;

		const texture = this._dataTexture(resolution);
		const data = texture.image.data as Float32Array;
		const pos = new Vector3();
		const distanceResult: HitPointInfo = {
			point: new Vector3(),
			distance: -1,
			faceIndex: -1,
		};
		const resx = resolution.x;
		const resy = resolution.y;
		const resz = resolution.z;
		const minx = bbox.min.x + voxelSizes.x * 0.5;
		const miny = bbox.min.y + voxelSizes.y * 0.5;
		const minz = bbox.min.z + voxelSizes.z * 0.5;
		const sizex = bboxSize.x;
		const sizey = bboxSize.y;
		const sizez = bboxSize.z;

		let i = 0;
		for (let z = 0; z < resz; z++) {
			for (let y = 0; y < resy; y++) {
				for (let x = 0; x < resx; x++) {
					// fit pos
					pos.x = (x / resx) * sizex + minx;
					pos.y = (y / resy) * sizey + miny;
					pos.z = (z / resz) * sizez + minz;

					boundsTree.closestPointToPoint(pos, distanceResult);
					// check if we are inside
					_rayDir.copy(distanceResult.point).sub(pos);
					_ray.origin.copy(pos);
					const res = boundsTree.raycastFirst(_ray, DoubleSide);
					const inside = res && res.face && res.face.normal.dot(_ray.direction) > 0.0;

					// TODO: get distance scale by object matrix
					// _rayDir.applyMatrix4(objectWorldMat);
					// const d = _rayDir.length();

					const d = distanceResult.distance;
					data[i] = inside ? -d : d;
					i++;
				}
			}
		}
		addSDFMetadataToContainer(texture, {
			boundMin: bbox.min,
			boundMax: bbox.max,
			resolution,
		});
		return texture;
	}

	/*
	 *
	 * CREATE TEXTURE
	 *
	 */
	private __dataTexture: Data3DTexture | undefined;
	private _resolutionUsed: Vector3 = new Vector3(-1, -1, -1);
	_dataTexture(resolution: Vector3) {
		return (this.__dataTexture = this.__dataTexture || this._createTexture(resolution));
	}
	private createTextureTargetIfRequired(resolution: Vector3) {
		if (!this.__dataTexture || !this._textureResolutionValid(resolution)) {
			this.__dataTexture = this._createTexture(resolution);
			this._resolutionUsed = resolution;
		}
	}
	private _textureResolutionValid(resolution: Vector3) {
		if (this.__dataTexture) {
			return resolution.equals(this._resolutionUsed);
		} else {
			return false;
		}
	}

	private _createTexture(resolution: Vector3) {
		return createSDFTexture(resolution.x, resolution.y, resolution.z);
	}

	/*
	 *
	 * CALLBACK
	 *
	 */
	// static PARAM_CALLBACK_render(node: SDFFromObjectCopNode) {
	// 	node.setDirty();
	// }
}
