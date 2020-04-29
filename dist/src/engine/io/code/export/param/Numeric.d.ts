import { ParamCodeExporter } from '../Param';
import { TypedNumericParam } from '../../../../params/_Numeric';
import { ParamType } from '../../../../poly/ParamType';
export declare class ParamNumericCodeExporter extends ParamCodeExporter<TypedNumericParam<ParamType>> {
    add_main(): void;
}
