export declare class CoreAttributeData {
    private _size;
    private _type;
    constructor(_size: number, _type: number);
    size(): number;
    type(): number;
    static from_value(attrib_value: any): CoreAttributeData;
}
