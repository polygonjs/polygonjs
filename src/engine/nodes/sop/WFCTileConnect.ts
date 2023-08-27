/**
 * connects WFC tiles
 *
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Object3D, Quaternion} from 'three';
import {WFCTileSide, rotatedSide, tileSideUnrotated, neighbourTileSideUnrotated} from '../../../core/wfc/WFCCommon';
import {CoreWFCTileAttribute} from '../../../core/wfc/WFCAttributes';
import { createConnectionObject } from '../../../core/wfc/WFCConnection';

const identityQuaternion = new Quaternion();
const _q = new Quaternion();
// const EPS = 0.001;
function _angleIncrement(object: Object3D) {
	// when a tile rotation is 2 rotations ( 2x90 = 180 ),
	// the rotation.y is not 180, but 0,
	// and we therefore check the quaternion angle intead.
	if (Math.abs(object.rotation.y) > 0.1) {
		return object.rotation.y / (Math.PI / 2);
	}
	_q.setFromRotationMatrix(object.matrix);
	return _q.angleTo(identityQuaternion) / (Math.PI / 2);
}

class WFCTileConnectSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new WFCTileConnectSopParamsConfig();

export class WFCTileConnectSopNode extends TypedSopNode<WFCTileConnectSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.WFC_TILE_CONNECT;
	}

	override initializeNode() {
		this.io.inputs.setCount(2);
		this.io.inputs.initInputsClonedState([InputCloneMode.FROM_NODE, InputCloneMode.NEVER]);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup0 = inputCoreGroups[0];
		const coreGroup1 = inputCoreGroups[1];
		const inputObjects = coreGroup0.allObjects();
		const templateObjects = coreGroup1.threejsObjects();

		const templateObjectsInGrid: Object3D[][][] = []; // x/y/z
		const _addTemplateObject = (templateObject: Object3D) => {
			const x = Math.round(templateObject.position.x);
			const y = Math.round(templateObject.position.y);
			const z = Math.round(templateObject.position.z);
			templateObjectsInGrid[x] = templateObjectsInGrid[x] || [];
			templateObjectsInGrid[x][y] = templateObjectsInGrid[x][y] || [];
			templateObjectsInGrid[x][y][z] = templateObject;
		};
		const _getTemplateObject = (x: number, y: number, z: number): Object3D | undefined => {
			x = Math.round(x);
			y = Math.round(y);
			z = Math.round(z);
			templateObjectsInGrid[x] = templateObjectsInGrid[x] || [];
			templateObjectsInGrid[x][y] = templateObjectsInGrid[x][y] || [];
			return templateObjectsInGrid[x][y][z];
		};
		const _addConnectionIfNeighbourFound = (
			currentObject: Object3D,
			xOffset: number,
			yOffset: number,
			zOffset: number
		) => {
			const x = Math.round(currentObject.position.x);
			const y = Math.round(currentObject.position.y);
			const z = Math.round(currentObject.position.z);
			const neighbour = _getTemplateObject(x + xOffset, y + yOffset, z + zOffset);
			if (!neighbour) {
				return;
			}

			const id0 = CoreWFCTileAttribute.getTileId(currentObject);
			const id1 = CoreWFCTileAttribute.getTileId(neighbour);
			const currentObjectSideUnrotated: WFCTileSide = tileSideUnrotated(xOffset, yOffset, zOffset);
			//xOffset < 0 ? 's' : xOffset > 0 ? 'n' : zOffset < 0 ? 'w' : zOffset > 0 ? 'e' : yOffset < 0 ? 'b' : 't';
			const currentObjectSide = rotatedSide(
				currentObjectSideUnrotated,
				Math.round(_angleIncrement(currentObject))
			);
			const neighbourSideUnrotated: WFCTileSide = neighbourTileSideUnrotated(xOffset, yOffset, zOffset);
			// xOffset < 0 ? 'n' : xOffset > 0 ? 's' : zOffset < 0 ? 'e' : zOffset > 0 ? 'w' : yOffset < 0 ? 't' : 'b';
			const neighbourSide = rotatedSide(neighbourSideUnrotated, Math.round(_angleIncrement(neighbour)));

			const group = createConnectionObject({
				id0,
				id1,
				side0: currentObjectSide,
				side1: neighbourSide,
			})
		
			inputObjects.push(group);
		};
		for (const templateObject of templateObjects) {
			const isTile = CoreWFCTileAttribute.getIsTile(templateObject);
			if (!isTile) {
				continue;
			}
			_addTemplateObject(templateObject);
		}
		for (const templateObject of templateObjects) {
			const isTile = CoreWFCTileAttribute.getIsTile(templateObject);
			if (!isTile) {
				continue;
			}
			_addConnectionIfNeighbourFound(templateObject, -1, 0, 0);
			_addConnectionIfNeighbourFound(templateObject, +1, 0, 0);
			_addConnectionIfNeighbourFound(templateObject, 0, -1, 0);
			_addConnectionIfNeighbourFound(templateObject, 0, +1, 0);
			_addConnectionIfNeighbourFound(templateObject, 0, 0, -1);
			_addConnectionIfNeighbourFound(templateObject, 0, 0, +1);
		}

		this.setObjects(inputObjects);
	}
}
