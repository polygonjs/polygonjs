interface Dictionary<T> {
	[Key: string]: T;
}
type valueof<T> = T[keyof T];
