function _createElement() {
	const div = document.createElement('div');
	div.style.position = 'absolute';
	div.style.top = '0px';
	div.style.left = '0px';
	div.style.backgroundColor = 'darkblue';
	div.style.padding = '5px';
	div.style.color = 'white';
	return div;
}

const div = _createElement();
export function mountDebugElement() {
	document.body.appendChild(div);
}
const elementByKey: Map<string, HTMLElement> = new Map();

export function debug(values: Record<string, number | undefined>) {
	// let child: Element | undefined;
	// while ((child = div.children[0])) {
	// 	div.removeChild(child);
	// }

	const keys = Object.keys(values);
	for (const key of keys) {
		const value = values[key];
		let elementForKey = elementByKey.get(key);
		if (!elementForKey) {
			elementForKey = document.createElement('div');
			elementByKey.set(key, elementForKey);
			div.appendChild(elementForKey);
		}
		const v = value != null ? value.toFixed(4) : 'null';
		elementForKey.innerHTML = `${key}: ${v}`;
	}
}
