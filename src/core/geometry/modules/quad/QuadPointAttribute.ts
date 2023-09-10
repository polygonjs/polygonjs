export class QuadPointAttribute {
	constructor(public array: number[], public itemSize: number) {}

	clone() {
		return new (this.constructor as typeof QuadPointAttribute)([...this.array], this.itemSize);
	}
}
