/**
 * places the tiles on the quads
 *
 *
 */
import {Object3D, Group} from 'three';
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {filterTileObjects} from '../../../core/wfc/WFCUtils';
import {QuadPrimitive} from '../../../core/geometry/modules/quad/QuadPrimitive';
import {CoreWFCTileAttribute, WFCQuadAttribute} from '../../../core/wfc/WFCAttributes';
import {stringToTileConfigs} from '../../../core/wfc/WFCTileConfig';
import {TileConfig} from '../../../core/wfc/WFCTileConfig';
import {placeObjectOnQuad} from '../../../core/wfc/WFCBuilder';
import {QuadObject} from '../../../core/geometry/modules/quad/QuadObject';
import {WFCTilesCollection} from '../../../core/wfc/WFCTilesCollection';
import {UNRESOLVED_TILE_ID, ERROR_TILE_ID} from '../../../core/wfc/WFCConstant';

class WFCBuilderSopParamsConfig extends NodeParamsConfig {
	/** @param tileHeight */
	tileHeight = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new WFCBuilderSopParamsConfig();

export class WFCBuilderSopNode extends TypedSopNode<WFCBuilderSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.WFC_BUILDER;
	}

	override initializeNode() {
		this.io.inputs.setCount(2);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup0 = inputCoreGroups[0];
		const coreGroup1 = inputCoreGroups[1];
		const quadObjects = coreGroup0.quadObjects();

		if (quadObjects == null || quadObjects.length == 0) {
			this.states.error.set('no quad objects found');
			return;
		}

		const tileAndRuleObjects = coreGroup1.threejsObjects();
		const tileObjects = filterTileObjects(tileAndRuleObjects);

		const newObjects: Object3D[] = [];

		for (const quadObject of quadObjects) {
			const tilesCollection = new WFCTilesCollection({tileAndRuleObjects});
			const primitivesCount = QuadPrimitive.primitivesCount(quadObject);
			const hasAttribute = QuadPrimitive.hasAttribute(quadObject, WFCQuadAttribute.SOLVED_TILE_CONFIGS);
			if (!hasAttribute) {
				this.states.error.set(`attribute not found: ${WFCQuadAttribute.SOLVED_TILE_CONFIGS}`);
				return;
			}
			for (let i = 0; i < primitivesCount; i++) {
				const solvedTileConfigsString = QuadPrimitive.attribValue(
					quadObject,
					i,
					WFCQuadAttribute.SOLVED_TILE_CONFIGS
				) as string | undefined;
				if (!solvedTileConfigsString) {
					this.states.error.set(`attribute empty in primitive: ${i}`);
					return;
				}
				const tileConfigs = stringToTileConfigs(solvedTileConfigsString);
				this._processTileConfigs(quadObject, i, tilesCollection, tileObjects, tileConfigs, newObjects);
			}
		}

		this.setObjects(newObjects);
	}
	private _processTileConfigs(
		quadObject: QuadObject,
		primitiveIndex: number,
		tilesCollection: WFCTilesCollection,
		tileObjects: Object3D[],
		tileConfigs: TileConfig[],
		newObjects: Object3D[]
	) {
		const count = tileConfigs.length;
		switch (count) {
			case 0: {
				console.warn('no tile configs found');
				return;
			}
			case 1: {
				const object = this._convertTileConfig(
					quadObject,
					primitiveIndex,
					tilesCollection,
					tileObjects,
					tileConfigs[0]
				);
				if (object) {
					newObjects.push(object);
				}
				return;
			}
			default: {
				const object = this._convertTileConfigs(
					quadObject,
					primitiveIndex,
					tilesCollection,
					tileObjects,
					tileConfigs
				);
				if (object) {
					newObjects.push(object);
				}
				return;
			}
		}
	}
	private _convertTileConfig(
		quadObject: QuadObject,
		primitiveIndex: number,
		tilesCollection: WFCTilesCollection,
		tileObjects: Object3D[],
		tileConfig: TileConfig
	): Object3D | undefined {
		const tileObject = this._tileObject(tilesCollection, tileConfig, tileObjects);
		if (!tileObject) {
			this.states.error.set(`tile object not found for tile id: ${tileConfig.tileId}`);
			return;
		}
		return placeObjectOnQuad({
			object: tileObject,
			quadObject,
			primitiveIndex,
			rotation: tileConfig.rotation,
			height: this.pv.tileHeight,
		});
	}
	private _convertTileConfigs(
		quadObject: QuadObject,
		primitiveIndex: number,
		tilesCollection: WFCTilesCollection,
		tileObjects: Object3D[],
		tileConfigs: TileConfig[]
	): Object3D | undefined {
		const objects: Object3D[] = [];
		for (const tileConfig of tileConfigs) {
			const object = this._convertTileConfig(
				quadObject,
				primitiveIndex,
				tilesCollection,
				tileObjects,
				tileConfig
			);
			if (object) {
				objects.push(object);
			}
		}

		const objectsCount = objects.length;
		const gridSizeX = Math.ceil(Math.sqrt(objectsCount));
		const gridSizeY = Math.ceil(objectsCount / gridSizeX);

		const group = new Group();
		for (let x = 0; x < gridSizeX; x++) {
			for (let y = 0; y < gridSizeY; y++) {
				const index = x + y * gridSizeX;
				if (index < objectsCount) {
					const object = objects[index];
					object.position.set(0.5 + x - gridSizeX / 2, 0, 0.5 + y - gridSizeY / 2);
					object.updateMatrix();
					group.add(object);
				}
			}
		}
		const max = Math.max(gridSizeX, gridSizeY);
		group.scale.multiplyScalar(1 / max);
		QuadPrimitive.position(quadObject, primitiveIndex, group.position);
		group.updateMatrix();
		group.matrixAutoUpdate = false;
		return group;
	}
	private _tileObject(tilesCollection: WFCTilesCollection, tileConfig: TileConfig, tileObjects: Object3D[]) {
		return tileConfig.tileId == UNRESOLVED_TILE_ID
			? tilesCollection.unresolvedTile()
			: tileConfig.tileId == ERROR_TILE_ID
			? tilesCollection.errorTile()
			: tileObjects.find((tileObject) => CoreWFCTileAttribute.getTileId(tileObject) == tileConfig.tileId);
	}
}
