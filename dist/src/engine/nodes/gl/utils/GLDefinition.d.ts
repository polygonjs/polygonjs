import { BaseGlNodeType } from '../_Base';
import { TypedGLDefinitionCollection } from './GLDefinitionCollection';
import { GlConnectionPointType } from '../../utils/io/connections/Gl';
export declare enum GLDefinitionType {
    ATTRIBUTE = "attribute",
    FUNCTION = "function",
    UNIFORM = "uniform",
    VARYING = "varying"
}
export declare abstract class TypedGLDefinition<T extends GLDefinitionType> {
    protected _definition_type: T;
    protected _data_type: GlConnectionPointType;
    protected _node: BaseGlNodeType;
    protected _name: string;
    constructor(_definition_type: T, _data_type: GlConnectionPointType, _node: BaseGlNodeType, _name: string);
    get definition_type(): T;
    get data_type(): GlConnectionPointType;
    get node(): BaseGlNodeType;
    get name(): string;
    abstract get line(): string;
    collection_instance(): TypedGLDefinitionCollection<T>;
}
export declare class AttributeGLDefinition extends TypedGLDefinition<GLDefinitionType.ATTRIBUTE> {
    protected _node: BaseGlNodeType;
    protected _data_type: GlConnectionPointType;
    protected _name: string;
    constructor(_node: BaseGlNodeType, _data_type: GlConnectionPointType, _name: string);
    get line(): string;
}
export declare class FunctionGLDefinition extends TypedGLDefinition<GLDefinitionType.FUNCTION> {
    protected _node: BaseGlNodeType;
    protected _name: string;
    constructor(_node: BaseGlNodeType, _name: string);
    get line(): string;
}
export declare class UniformGLDefinition extends TypedGLDefinition<GLDefinitionType.UNIFORM> {
    protected _node: BaseGlNodeType;
    protected _data_type: GlConnectionPointType;
    protected _name: string;
    constructor(_node: BaseGlNodeType, _data_type: GlConnectionPointType, _name: string);
    get line(): string;
}
export declare class VaryingGLDefinition extends TypedGLDefinition<GLDefinitionType.VARYING> {
    protected _node: BaseGlNodeType;
    protected _data_type: GlConnectionPointType;
    protected _name: string;
    constructor(_node: BaseGlNodeType, _data_type: GlConnectionPointType, _name: string);
    get line(): string;
}
export declare type BaseGLDefinition = TypedGLDefinition<GLDefinitionType>;
