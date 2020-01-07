import {ViewerLoader} from './Loader'

export class ViewerLoadersManager {

	private _viewers_required: boolean = true
	private _loaders: ViewerLoader[] = []

	constructor(){
	}

	viewers_required(){
		return this._viewers_required
	}

	register_loader(loader: ViewerLoader){
		this._loaders.push(loader)
	}

	dipose_loaders(){
		this._viewers_required = false;

		let loader;
		while(loader = this._loaders.pop()){
			loader.dispose()
		}
	}
}
