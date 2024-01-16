/**
 * Adds properties for WFC tiles
 *
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreWFCTileAttribute} from '../../../core/wfc/WFCAttributes';
import {filterObjectsFromCoreGroup} from '../../../core/geometry/Mask';
import {BufferGeometry, Vector3, Float32BufferAttribute} from 'three';
import {CoreGeometryBuilderMerge} from '../../../core/geometry/modules/three/builders/Merge';
import {ObjectType} from '../../../core/geometry/Constant';
import {BaseSopOperation} from '../../operations/sop/_Base';
import {rotateGeometry} from '../../../core/Transform';
import {Attribute} from '../../../core/geometry/Attribute';

const DEFAULT_UP = new Vector3(0, 1, 0);
const SOUTH_DIR = new Vector3(-1, 0, 0);
const NORTH_DIR = new Vector3(+1, 0, 0);
const WEST_DIR = new Vector3(0, 0, -1);
const EAST_DIR = new Vector3(0, 0, +1);
const BOTTOM_DIR = new Vector3(0, -1, 0);
const TOP_DIR = new Vector3(0, +1, 0);
const _tmp = new Vector3();

class WFCTileSideNameSopParamsConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING('', {
		objectMask: true,
	});
	sameNameForSelectedSides = ParamConfig.BOOLEAN(1);
	/** @param south side */
	south = ParamConfig.BOOLEAN(0);
	southName = ParamConfig.STRING('', {
		visibleIf: {sameNameForSelectedSides: 0, south: 1},
	});
	/** @param north side */
	north = ParamConfig.BOOLEAN(0);
	northName = ParamConfig.STRING('', {
		visibleIf: {sameNameForSelectedSides: 0, north: 1},
	});
	/** @param west side */
	west = ParamConfig.BOOLEAN(0);
	westName = ParamConfig.STRING('', {
		visibleIf: {sameNameForSelectedSides: 0, west: 1},
	});
	/** @param east side */
	east = ParamConfig.BOOLEAN(0);
	eastName = ParamConfig.STRING('', {
		visibleIf: {sameNameForSelectedSides: 0, east: 1},
	});
	/** @param bottom side */
	bottom = ParamConfig.BOOLEAN(0);
	bottomName = ParamConfig.STRING('', {
		visibleIf: {sameNameForSelectedSides: 0, bottom: 1},
	});
	/** @param top side */
	top = ParamConfig.BOOLEAN(0);
	topName = ParamConfig.STRING('', {
		visibleIf: {sameNameForSelectedSides: 0, top: 1},
	});
	/** @param allowedRotationY */
	sideName = ParamConfig.STRING('', {
		visibleIf: {sameNameForSelectedSides: 1},
	});
	/** @param highlight */
	highlight = ParamConfig.BOOLEAN(false);
}
const ParamsConfig = new WFCTileSideNameSopParamsConfig();

export class WFCTileSideNameSopNode extends TypedSopNode<WFCTileSideNameSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.WFC_TILE_SIDE_NAME;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		const objects = filterObjectsFromCoreGroup(coreGroup, this.pv);

		const {sameNameForSelectedSides, south, north, west, east, bottom, top} = this.pv;

		if (sameNameForSelectedSides == true) {
			const sideName = this.pv.sideName;
			for (const object of objects) {
				if (south) {
					CoreWFCTileAttribute.setSideName(object, 's', sideName);
				}
				if (north) {
					CoreWFCTileAttribute.setSideName(object, 'n', sideName);
				}
				if (west) {
					CoreWFCTileAttribute.setSideName(object, 'w', sideName);
				}
				if (east) {
					CoreWFCTileAttribute.setSideName(object, 'e', sideName);
				}
				if (bottom) {
					CoreWFCTileAttribute.setSideName(object, 'b', sideName);
				}
				if (top) {
					CoreWFCTileAttribute.setSideName(object, 't', sideName);
				}
			}
		} else {
			for (const object of objects) {
				if (south) {
					CoreWFCTileAttribute.setSideName(object, 's', this.pv.southName);
				}
				if (north) {
					CoreWFCTileAttribute.setSideName(object, 'n', this.pv.northName);
				}
				if (west) {
					CoreWFCTileAttribute.setSideName(object, 'w', this.pv.westName);
				}
				if (east) {
					CoreWFCTileAttribute.setSideName(object, 'e', this.pv.eastName);
				}
				if (bottom) {
					CoreWFCTileAttribute.setSideName(object, 'b', this.pv.bottomName);
				}
				if (top) {
					CoreWFCTileAttribute.setSideName(object, 't', this.pv.topName);
				}
			}
		}
		if (this.pv.highlight) {
			const geometries: BufferGeometry[] = [];
			if (south) {
				geometries.push(this._createHighlightPlane(SOUTH_DIR));
			}
			if (north) {
				geometries.push(this._createHighlightPlane(NORTH_DIR));
			}
			if (west) {
				geometries.push(this._createHighlightPlane(WEST_DIR));
			}
			if (east) {
				geometries.push(this._createHighlightPlane(EAST_DIR));
			}
			if (bottom) {
				geometries.push(this._createHighlightPlane(BOTTOM_DIR));
			}
			if (top) {
				geometries.push(this._createHighlightPlane(TOP_DIR));
			}
			const mergedGeometry = CoreGeometryBuilderMerge.merge(geometries);
			if (mergedGeometry) {
				const mergedObject = BaseSopOperation.createObject(mergedGeometry, ObjectType.LINE_SEGMENTS);
				objects.push(mergedObject);
			}
		}

		this.setObjects(objects);
	}
	private _createHighlightPlane(dir: Vector3): BufferGeometry {
		const geometry = new BufferGeometry();

		const positions: number[] = [];
		positions.push(-0.45, 0, -0.45);
		positions.push(0.45, 0, -0.45);
		positions.push(0.45, 0, 0.45);
		positions.push(-0.45, 0, 0.45);
		const indices: number[] = [];
		indices.push(0, 1, 1, 2, 2, 3, 3, 0);

		geometry.setAttribute(Attribute.POSITION, new Float32BufferAttribute(positions, 3));
		geometry.setIndex(indices);

		rotateGeometry(geometry, DEFAULT_UP, dir);
		_tmp.copy(dir).multiplyScalar(0.55);
		geometry.translate(_tmp.x, _tmp.y, _tmp.z);

		return geometry;
	}
}
