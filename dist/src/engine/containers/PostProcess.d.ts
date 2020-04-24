import { TypedContainer } from './_Base';
import { ContainableMap } from './utils/ContainableMap';
export declare class PostProcessContainer extends TypedContainer<ContainableMap['POST']> {
    set_content(content: ContainableMap['POST']): void;
    render_pass(): number;
    object(options?: {}): number;
}
