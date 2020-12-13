import { BaseGlNodeType } from '../../_Base';
import { UniformGLDefinition } from '../../utils/GLDefinition';
import { GlConnectionPointType } from '../../../utils/io/connections/Gl';
export declare class UniformConfig {
    protected _gl_type: GlConnectionPointType;
    protected _name: string;
    constructor(_gl_type: GlConnectionPointType, _name: string);
    create_definition(node: BaseGlNodeType): UniformGLDefinition;
}
