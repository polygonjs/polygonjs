import {Object3D, Group} from 'three';
import {QuadObject} from '../geometry/modules/quad/QuadObject';
import {WFCTilesCollection} from './WFCTilesCollection';
import {filterTileObjects} from './WFCUtils';
import {TileConfig, stringToTileConfigs} from './WFCTileConfig';
import {placeObjectOnQuad} from './WFCBuilderUtils';
import {WFCBuilderSopNode} from '../../engine/nodes/sop/WFCBuilder';
import {QuadPrimitive} from '../geometry/modules/quad/QuadPrimitive';
import {ERROR_TILE_ID, UNRESOLVED_TILE_ID} from './WFCConstant';
import {CoreWFCTileAttribute, WFCQuadAttribute} from './WFCAttributes';
import {CoreObjectType, ObjectContent} from '../geometry/ObjectContent';
import {coreObjectClassFactory, corePrimitiveClassFactory} from '../geometry/CoreObjectFactory';

interface WFCBuilderOptions {
	node: WFCBuilderSopNode;
	quadObject: QuadObject;
	tileAndRuleObjects: Object3D[];
	tileHeight: number;
}

export class WFCBuilder {
	private _node: WFCBuilderSopNode;
	private _quadObject: QuadObject;
	private _tileObjects: Object3D[];
	private _tileHeight: number;
	private _tilesCollection: WFCTilesCollection;
	private _primitivesCount: number;
	constructor(options: WFCBuilderOptions) {
		const {node, quadObject, tileAndRuleObjects, tileHeight} = options;
		this._node = node;
		this._quadObject = quadObject;
		this._tileObjects = filterTileObjects(tileAndRuleObjects);
		this._tileHeight = tileHeight;
		this._tilesCollection = new WFCTilesCollection({tileAndRuleObjects});
		this._primitivesCount = QuadPrimitive.entitiesCount(quadObject);
		const hasAttribute = QuadPrimitive.hasAttribute(quadObject, WFCQuadAttribute.SOLVED_TILE_CONFIGS);
		if (!hasAttribute) {
			this._node.states.error.set(`attribute not found: ${WFCQuadAttribute.SOLVED_TILE_CONFIGS}`);
			return;
		}
	}
	createObjects() {
		const group = new Group();
		group.matrixAutoUpdate = false;
		this._createObjects(this._quadObject, group);
		return group;
	}
	update(builderObject: Object3D, solverObject: ObjectContent<CoreObjectType>) {
		builderObject.remove(...builderObject.children);
		this._createObjects(solverObject, builderObject);
	}

	private _createObjects(solverObject: ObjectContent<CoreObjectType>, parent: Object3D) {
		const primitiveClass = corePrimitiveClassFactory(solverObject);

		for (let i = 0; i < this._primitivesCount; i++) {
			const solvedTileConfigsString = primitiveClass.attribValue(
				solverObject,
				i,
				WFCQuadAttribute.SOLVED_TILE_CONFIGS
			) as string | undefined;
			if (!solvedTileConfigsString) {
				this._node.states.error.set(`attribute empty in primitive: ${i}`);
				return;
			}
			const tileConfigs = stringToTileConfigs(solvedTileConfigsString);
			this._processTileConfigs(
				this._quadObject,
				i,
				this._tilesCollection,
				this._tileObjects,
				tileConfigs,
				parent
			);
		}
	}

	private _processTileConfigs(
		quadObject: QuadObject,
		primitiveIndex: number,
		tilesCollection: WFCTilesCollection,
		tileObjects: Object3D[],
		tileConfigs: TileConfig[],
		parent: Object3D
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
					parent.add(object);
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
					parent.add(object);
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
			this._node.states.error.set(`tile object not found for tile id: ${tileConfig.tileId}`);
			return;
		}
		const newObject = placeObjectOnQuad({
			object: tileObject,
			quadObject,
			primitiveIndex,
			rotation: tileConfig.rotation,
			height: this._tileHeight,
		});

		// add attribute
		const quadId = QuadPrimitive.attribValue(quadObject, primitiveIndex, WFCQuadAttribute.QUAD_ID);
		coreObjectClassFactory(newObject).addAttribute(newObject, WFCQuadAttribute.QUAD_ID, quadId);

		return newObject;
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
