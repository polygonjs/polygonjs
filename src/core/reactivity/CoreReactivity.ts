//
// https://antfu.me/posts/watch-with-reactivity
//

import {computed, Ref, ref} from '@vue/reactivity';
import {watch} from '@vue-reactivity/watch';

// function traverse(value: any, seen: Set<any>) {
// 	console.log(value);
// 	if (seen.has(value)) {
// 		return value;
// 	}
// 	if (!CoreType.isObject(value)) {
// 		return value;
// 	}

// 	seen.add(value); // prevent circular reference
// 	if (CoreType.isArray(value)) {
// 		for (let i = 0; i < value.length; i++) traverse(value[i], seen);
// 	} else {
// 		for (const key of Object.keys(value)) traverse((value as any)[key], seen);
// 	}
// 	return value;
// }

// interface WatchOptions {
// 	deep: boolean;
// 	lazy?: boolean;
// }
// function watch(source: any, fn: EffectScheduler, options?: WatchOptions) {
// 	options = options || {deep: false, lazy: false};
// 	const {deep, lazy} = options;
// 	let getter = isRef(source) ? () => source.value : isReactive(source) ? () => source : source;
// 	console.log({source, isRef: isRef(source), getter, fn});
// 	if (deep) {
// 		const seen = new Set();
// 		const _getter = () => traverse(getter(), seen);
// 		getter = _getter;
// 	}

// 	const runner = effect(getter, {
// 		lazy,
// 		scheduler: fn,
// 	});
// 	console.log(runner);

// 	return () => stop(runner);
// }

const MAX = Math.floor(Number.MAX_SAFE_INTEGER / 100);
export function incrementRefSafely(_ref: Ref<number>) {
	if (_ref.value > MAX) {
		_ref.value = 0;
	} else {
		_ref.value += 1;
	}
}
export function dummyReadRefVal(value: number) {
	// we just need this method to force a call to .value
	// and ensure that we have a dependency with the ref()
}

export {computed, ref, watch};
