export class QuadPrimAttribute {
	constructor(public array: number[], public itemSize: number) {}
	clone() {
		return new (this.constructor as typeof QuadPrimAttribute)([...this.array], this.itemSize);
	}
}
