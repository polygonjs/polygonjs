// import {pushOnArrayAtEntry} from '../MapUtils';
import {CoreWFCTileAttribute} from './WFCAttributes';
import {WFCTileSide, WFCRule, sortTileIds, SortedTileIds, ALL_SIDES} from './WFCCommon';
import {validRuleObject, wfcRuleFromObject} from './WFCRule';
import {filterTileObjects, filterRuleObjects} from './WFCUtils';
import {Object3D} from 'three';

const _sortedTileIds: SortedTileIds = {
	first: '',
	second: '',
};
type TraverseRulesCallback = (id0: string, id1: string, side0: WFCTileSide, side1: WFCTileSide) => void;
type TraverseUnconnectedSidesCallback = (side: WFCTileSide[]) => void;

type RulesByTileId = Map<string, Map<string, Map<WFCTileSide, Set<WFCTileSide>>>>;
function _addRule(rule: WFCRule, rulesByTileId: RulesByTileId, invert: boolean) {
	sortTileIds(rule.id0, rule.id1, _sortedTileIds, invert);
	let mapForId0 = rulesByTileId.get(_sortedTileIds.first);
	if (!mapForId0) {
		mapForId0 = new Map();
		rulesByTileId.set(_sortedTileIds.first, mapForId0);
	}
	let sides = mapForId0.get(_sortedTileIds.second);
	if (!sides) {
		sides = new Map();
		mapForId0.set(_sortedTileIds.second, sides);
	}
	let inverted = rule.id0 != _sortedTileIds.first;
	const _side0 = inverted ? rule.side1 : rule.side0;
	const _side1 = inverted ? rule.side0 : rule.side1;
	const side0s = _side0.split('') as WFCTileSide[];
	const side1s = _side1.split('') as WFCTileSide[];
	for (const side0 of side0s) {
		for (const side1 of side1s) {
			let side1s = sides.get(side0);
			if (!side1s) {
				side1s = new Set();
				sides.set(side0, side1s);
			}
			if (!side1s.has(side1)) {
				side1s.add(side1);
			}
		}
	}
}
interface WFCTilesCollectionOptions {
	tileAndRuleObjects: Object3D[];
}
export class WFCTilesCollection {
	private _tiles: Object3D[];
	private _tilesById: Map<string, Object3D>;
	private _rulesByTileId: RulesByTileId = new Map();
	private _errorTileObject: Object3D | null;
	private _unresolvedTileObject: Object3D | null;
	constructor(options: WFCTilesCollectionOptions) {
		this._tiles = filterTileObjects(options.tileAndRuleObjects);
		this._errorTileObject = this._tiles.find((o) => CoreWFCTileAttribute.getIsErrorTile(o)) || null;
		this._unresolvedTileObject = this._tiles.find((o) => CoreWFCTileAttribute.getIsUnresolvedTile(o)) || null;
		this._tilesById = new Map();
		for (const tile of this._tiles) {
			this._tilesById.set(CoreWFCTileAttribute.getTileId(tile), tile);
		}

		// create connections from connection objects
		const ruleObjects = filterRuleObjects(options.tileAndRuleObjects);
		const rules = ruleObjects.filter(validRuleObject).map(wfcRuleFromObject);
		for (const rule of rules) {
			sortTileIds(rule.id0, rule.id1, _sortedTileIds);
			_addRule(rule, this._rulesByTileId, false);
			_addRule(rule, this._rulesByTileId, true);
		}
	}
	tiles() {
		return this._tiles;
	}
	tile(tileId: string) {
		return this._tilesById.get(tileId);
	}
	errorTile() {
		return this._errorTileObject;
	}
	unresolvedTile() {
		return this._unresolvedTileObject;
	}
	traverseRules(id0: string, id1: string, callback: TraverseRulesCallback): void {
		sortTileIds(id0, id1, _sortedTileIds);
		const mapForFirst = this._rulesByTileId.get(_sortedTileIds.first);
		if (!mapForFirst) {
			return;
		}
		const sides = mapForFirst.get(_sortedTileIds.second);
		if (!sides) {
			return;
		}
		sides.forEach((side1s, side0) => {
			side1s.forEach((side1) => {
				callback(_sortedTileIds.first, _sortedTileIds.second, side0, side1);
			});
		});
	}
	traverseUnconnectedSides(id: string, callback: TraverseUnconnectedSidesCallback): void {
		const mapForFirst = this._rulesByTileId.get(id);
		if (!mapForFirst) {
			callback(ALL_SIDES);
			return;
		}
		const unconnectedSides = [...ALL_SIDES];
		mapForFirst.forEach((sides, id1) => {
			sides.forEach((side1s, side0) => {
				const index = unconnectedSides.indexOf(side0);
				if (index > -1) {
					unconnectedSides.splice(index, 1);
				}
			});
		});
		callback(unconnectedSides);
	}
	allowedTileConfig(id0: string, side0: WFCTileSide, id1: string, side1: WFCTileSide): boolean {
		// console.log('allowedTileConfig', {id0, side0, id1, side1});
		sortTileIds(id0, id1, _sortedTileIds);
		const mapForFirst = this._rulesByTileId.get(_sortedTileIds.first);
		if (!mapForFirst) {
			return false;
		}
		const sides = mapForFirst.get(_sortedTileIds.second);
		if (!sides) {
			return false;
		}
		let inverted = id0 != _sortedTileIds.first;
		const key = inverted ? side1 : side0;
		const value = inverted ? side0 : side1;
		const side1s = sides.get(key);
		if (!side1s) {
			return false;
		}

		return side1s.has(value);
	}
}
