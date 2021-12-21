export interface CSSOptions {
	posterUrl: string;
}
type CSSFunction = (options: CSSOptions) => string;
export interface HTMLOptions {}
type HTMLFunction = (options: HTMLOptions) => string;
export interface JSOptions {}
type JSFunction = (options: JSOptions) => string;
interface TemplatesFunctions {
	CSS: CSSFunction;
	HTML: HTMLFunction;
	JS: JSFunction;
}
export interface TemplatesOptions {
	CSS: CSSOptions;
	HTML: HTMLOptions;
	JS: JSOptions;
}
export type OnProgress = (ratio: number) => void;

export class BaseProgressBar {
	private _templateHTMLFunction: HTMLFunction;
	private _templateCSSFunction: CSSFunction;
	private _templateJSFunction: JSFunction;
	constructor(templatesFunctions: TemplatesFunctions) {
		this._templateCSSFunction = templatesFunctions.CSS;
		this._templateHTMLFunction = templatesFunctions.HTML;
		this._templateJSFunction = templatesFunctions.JS;
	}

	templates(options: TemplatesOptions) {
		return {
			CSS: this._templateCSSFunction(options.CSS),
			JS: this._templateJSFunction(options.JS),
			HTML: this._templateHTMLFunction(options.HTML),
		};
	}
}
