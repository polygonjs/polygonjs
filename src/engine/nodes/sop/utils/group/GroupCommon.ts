import {CoreEntity} from '../../../../../core/geometry/Entity';

export type CoreEntitySelectionState = Map<CoreEntity, boolean>;

export function updateSelectionState(selectionStates: CoreEntitySelectionState, entity: CoreEntity, state: boolean) {
	const currentState = selectionStates.get(entity);
	if (!currentState) {
		selectionStates.set(entity, state);
	}
}

export function selectedIndicesFromSelectionStates(
	selectionStates: CoreEntitySelectionState,
	selectedIndices: Set<number>,
	invert: boolean
): void {
	selectionStates.forEach((state, entity) => {
		const selected = (!invert && state) || (invert && !state);
		if (selected) {
			selectedIndices.add(entity.index());
		}
	});
}
