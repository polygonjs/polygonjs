import { IntegrationData } from '../../engine/nodes/_Base';
export declare class CoreMapboxClient {
    static CSS_URL: string;
    static _token: string;
    static ensure_token_is_set(): void;
    static token(): string;
    static set_token(token: string): void;
    static fetch_token(): string | undefined;
    private static _read_token_from_html;
    static integration_data(): IntegrationData | void;
}
