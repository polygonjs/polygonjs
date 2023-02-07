export class CoreMapboxString {
	static toId(val: string): number {
		if (val == null) {
			return 0;
		}

		const elements = val.split('').reverse();
		let id = 0;
		let exp = 0;
		for (let i = 0; i < elements.length; i++) {
			let index = elements[i].charCodeAt(0);

			if (index >= 0) {
				exp = i % 10;
				id += index * 10 ** exp;
				id = id % Number.MAX_SAFE_INTEGER;
			}
		}
		return id;
	}
}
