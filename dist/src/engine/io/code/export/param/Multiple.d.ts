import { ParamCodeExporter } from '../Param';
import { TypedMultipleParam } from '../../../../params/_Multiple';
import { ParamType } from '../../../../poly/ParamType';
export declare class ParamMultipleCodeExporter extends ParamCodeExporter<TypedMultipleParam<ParamType>> {
    as_code_default_value_string(): string;
    add_main(): void;
}
