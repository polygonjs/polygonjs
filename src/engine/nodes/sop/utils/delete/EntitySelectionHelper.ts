import {DeleteSopNode} from '../../Delete';
import {CoreEntity} from '../../../../../core/geometry/CoreEntity';
import {isBooleanTrue} from '../../../../../core/BooleanValue';

export class EntitySelectionHelper {
	public readonly selectedState: Map<CoreEntity, boolean> = new Map();
	private _entitiesCount: number = 0;
	private _selectedEntitiesCount: number = 0;
	constructor(protected node: DeleteSopNode) {}

	init(entities: CoreEntity[]) {
		this.selectedState.clear();
		for (const entity of entities) {
			this.selectedState.set(entity, false);
		}
		this._entitiesCount = entities.length;
		this._selectedEntitiesCount = 0;
	}
	select(entity: CoreEntity) {
		const state = this.selectedState.get(entity);
		if (state != null) {
			if (state == false) {
				this.selectedState.set(entity, true);
				this._selectedEntitiesCount++;
			}
		}
	}
	entitiesToKeep(): CoreEntity[] {
		return this._entitiesForState(isBooleanTrue(this.node.pv.invert));
	}
	entitiesToDelete(): CoreEntity[] {
		return this._entitiesForState(!isBooleanTrue(this.node.pv.invert));
	}
	private _entitiesForState(state: boolean): CoreEntity[] {
		const requiredState = state ? true : false;
		const arraySize = state ? this._selectedEntitiesCount : this._entitiesCount - this._selectedEntitiesCount;

		if (arraySize == 0) {
			return [];
		} else {
			const array: CoreEntity[] = new Array(arraySize);
			let i = 0;
			this.selectedState.forEach((state, entity) => {
				if (state == requiredState) {
					array[i] = entity;
					i++;
				}
			});
			return array;
		}
	}
}
