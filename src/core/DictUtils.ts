export function dictionaryInvert<T extends string, U extends string>(dict: Record<T, U>): Record<U, T> {
	const invertedDict: Record<U, T> = {} as Record<U, T>;
	const keys = Object.keys(dict);
	for (const key of keys) {
		const value = dict[key as T];
		invertedDict[value as U] = key as T;
	}
	return invertedDict;
}
