// export class EntityGroup {
// 	private _indices: Set<number> = new Set();

// 	add(index: number) {
// 		this._indices.add(index);
// 	}
// 	remove(index: number) {
// 		this._indices.delete(index);
// 	}
// 	copy(group: EntityGroup) {
// 		this._indices.clear();
// 		for (let index of group._indices) {
// 			this.add(index);
// 		}
// 	}
// 	clone() {
// 		const clone = new EntityGroup();
// 		clone.copy(this);
// 		return clone;
// 	}
// }
