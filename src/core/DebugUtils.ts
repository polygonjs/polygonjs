// import {isNumber} from './Type';

// function _createElement() {
// 	const div = document.createElement('div');
// 	div.style.position = 'absolute';
// 	div.style.top = '0px';
// 	div.style.left = '0px';
// 	div.style.backgroundColor = 'darkblue';
// 	div.style.padding = '5px';
// 	div.style.color = 'white';
// 	div.style.opacity = '70%';
// 	div.style.pointerEvents = 'none';
// 	return div;
// }

// const div = _createElement();
// export function coreMountDebugElement() {
// 	if (div.parentElement) {
// 		return;
// 	}
// 	document.body.appendChild(div);
// }
// const elementByKey: Map<string, HTMLElement> = new Map();
// const MAX_CHILDREN_COUNT = 10;

// export function coreDebug(values: Record<string, string | number | undefined>) {
// 	while (div.children.length > MAX_CHILDREN_COUNT) {
// 		const firstChild = div.children[0];
// 		div.removeChild(firstChild);
// 	}

// 	const keys = Object.keys(values);
// 	for (const key of keys) {
// 		const value = values[key];
// 		let elementForKey = elementByKey.get(key);
// 		if (!elementForKey) {
// 			elementForKey = document.createElement('div');
// 			elementByKey.set(key, elementForKey);
// 			div.appendChild(elementForKey);
// 		}
// 		const v = value != null ? _getValue(value) : 'null';
// 		elementForKey.innerHTML = `${key}: ${v}`;
// 		// console.log(key, v);
// 	}
// }
// function _getValue(value: string | number) {
// 	if (isNumber(value)) {
// 		return value.toFixed(4);
// 	}
// 	return value;
// }
