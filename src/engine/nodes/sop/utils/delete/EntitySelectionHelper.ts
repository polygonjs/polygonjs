import {DeleteSopNode} from '../../Delete';

import {CoreEntity} from '../../../../../core/geometry/Entity';

export class EntitySelectionHelper {
	public readonly selected_state: Map<CoreEntity, boolean> = new Map();
	private _entities_count: number = 0;
	private _selected_entities_count: number = 0;
	constructor(protected node: DeleteSopNode) {}

	init(entities: CoreEntity[]) {
		this.selected_state.clear();
		for (let entity of entities) {
			this.selected_state.set(entity, false);
		}
		this._entities_count = entities.length;
		this._selected_entities_count = 0;
	}
	select(entity: CoreEntity) {
		const state = this.selected_state.get(entity);
		if (state != null) {
			if (state == false) {
				this.selected_state.set(entity, true);
				this._selected_entities_count++;
			}
		}
	}
	entities_to_keep(): CoreEntity[] {
		return this._entities_for_state(this.node.pv.invert);
	}
	entities_to_delete(): CoreEntity[] {
		return this._entities_for_state(!this.node.pv.invert);
	}
	private _entities_for_state(state: boolean): CoreEntity[] {
		const required_state = state ? true : false;
		const array_size = state ? this._selected_entities_count : this._entities_count - this._selected_entities_count;

		if (array_size == 0) {
			return [];
		} else {
			const array: CoreEntity[] = new Array(array_size);
			let i = 0;
			this.selected_state.forEach((state, entity) => {
				if (state == required_state) {
					array[i] = entity;
					i++;
				}
			});
			return array;
		}
	}
}
