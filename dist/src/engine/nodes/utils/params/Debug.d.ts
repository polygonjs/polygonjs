declare enum Type {
    BOOLEAN = "boolean",
    BUTTON = "button"
}
declare type Input = boolean | null;
declare type InputMapGeneric = {
    [key in Type]: Input;
};
interface InputMap extends InputMapGeneric {
    [Type.BOOLEAN]: boolean;
    [Type.BUTTON]: null;
}
declare type Output = 0 | 1 | null;
declare type OutputMapGeneric = {
    [key in Type]: Output;
};
interface OutputMap extends OutputMapGeneric {
    [Type.BOOLEAN]: 0 | 1;
    [Type.BUTTON]: null;
}
export declare class ParamsValueToDefaultConverter {
    static convert<T extends Type>(type: T, value: InputMap[T]): OutputMap[T];
}
export {};
