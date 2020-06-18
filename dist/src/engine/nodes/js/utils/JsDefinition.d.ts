import { BaseJsNodeType } from '../_Base';
import { TypedJsDefinitionCollection } from './JsDefinitionCollection';
import { JsConnectionPointType } from '../../utils/io/connections/Js';
export declare enum JsDefinitionType {
    ATTRIBUTE = "attribute",
    FUNCTION = "function",
    UNIFORM = "uniform"
}
export declare abstract class TypedJsDefinition<T extends JsDefinitionType> {
    protected _definition_type: T;
    protected _data_type: JsConnectionPointType;
    protected _node: BaseJsNodeType;
    protected _name: string;
    constructor(_definition_type: T, _data_type: JsConnectionPointType, _node: BaseJsNodeType, _name: string);
    get definition_type(): T;
    get data_type(): JsConnectionPointType;
    get node(): BaseJsNodeType;
    get name(): string;
    abstract get line(): string;
    collection_instance(): TypedJsDefinitionCollection<T>;
}
export declare class AttributeGLDefinition extends TypedJsDefinition<JsDefinitionType.ATTRIBUTE> {
    protected _node: BaseJsNodeType;
    protected _data_type: JsConnectionPointType;
    protected _name: string;
    constructor(_node: BaseJsNodeType, _data_type: JsConnectionPointType, _name: string);
    get line(): string;
}
export declare class FunctionJsDefinition extends TypedJsDefinition<JsDefinitionType.FUNCTION> {
    protected _node: BaseJsNodeType;
    protected _name: string;
    constructor(_node: BaseJsNodeType, _name: string);
    get line(): string;
}
export declare class UniformJsDefinition extends TypedJsDefinition<JsDefinitionType.UNIFORM> {
    protected _node: BaseJsNodeType;
    protected _data_type: JsConnectionPointType;
    protected _name: string;
    constructor(_node: BaseJsNodeType, _data_type: JsConnectionPointType, _name: string);
    get line(): string;
}
export declare type BaseJsDefinition = TypedJsDefinition<JsDefinitionType>;
