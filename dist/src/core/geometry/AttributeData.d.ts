import { AttribType } from './Constant';
export declare class CoreAttributeData {
    private _size;
    private _type;
    constructor(_size: number, _type: AttribType);
    size(): number;
    type(): AttribType;
    static from_value(attrib_value: any): CoreAttributeData;
}
