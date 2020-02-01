enum Type {
	BOOLEAN = 'boolean',
	BUTTON = 'button',
}

type Input = boolean | null;
type InputMapGeneric = {[key in Type]: Input};
interface InputMap extends InputMapGeneric {
	[Type.BOOLEAN]: boolean;
	[Type.BUTTON]: null;
}

type Output = 0 | 1 | null;
type OutputMapGeneric = {[key in Type]: Output};
interface OutputMap extends OutputMapGeneric {
	[Type.BOOLEAN]: 0 | 1;
	[Type.BUTTON]: null;
}

type ConvertMethod<T extends Type> = (val: InputMap[T]) => OutputMap[T];

const convert_boolean: ConvertMethod<Type.BOOLEAN> = function(value: InputMap[Type.BOOLEAN]): OutputMap[Type.BOOLEAN] {
	return value ? 1 : 0;
};
const convert_button: ConvertMethod<Type.BUTTON> = function(value: InputMap[Type.BUTTON]): OutputMap[Type.BUTTON] {
	return value;
};

type ConvertMethodMapGeneric = {[key in Type]: ConvertMethod<key>};
const ConvertMap: ConvertMethodMapGeneric = {
	[Type.BOOLEAN]: convert_boolean,
	[Type.BUTTON]: convert_button,
};

// type Types = Type.BOOLEAN|Type.BUTTON

export class ParamsValueToDefaultConverter {
	static convert<T extends Type>(type: T, value: InputMap[T]): OutputMap[T] {
		const method: ConvertMethod<T> = (<unknown>ConvertMap[type]) as ConvertMethod<T>;
		return method(value);
	}
}

ParamsValueToDefaultConverter.convert(Type.BOOLEAN, false);
ParamsValueToDefaultConverter.convert(Type.BUTTON, null);
