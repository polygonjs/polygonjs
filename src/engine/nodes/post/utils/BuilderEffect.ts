import {Uniform, WebGLRenderer, WebGLRenderTarget, Texture} from 'three';
import {Effect, BlendFunction, EffectComposer} from 'postprocessing';
import {IUniforms} from '../../../../core/geometry/Material';

// import fragmentShader from '../gl/builder.glsl';

interface BuilderEffectOptions {
	fragmentShader: string;
}

export class BuilderEffect extends Effect {
	constructor(private _composerInput1: EffectComposer, options: BuilderEffectOptions) {
		super('BuilderEffect', options.fragmentShader, {
			blendFunction: BlendFunction.NORMAL,
			uniforms: new Map([
				// ['texture1', new Uniform(null)],
				['textureInput1', new Uniform(null)],
			]),
		});
	}

	updateFragmentShader(fragmentShader: string) {
		this.setFragmentShader(fragmentShader);
	}
	updateUniforms(uniforms: IUniforms) {
		const uniformNames = Object.keys(uniforms);
		for (let uniformName of uniformNames) {
			// no need to add time, as it is already there and this would actually create a conflict
			if (uniformName != 'time') {
				this.uniforms.set(uniformName, uniforms[uniformName] as Uniform);
			}
		}
	}

	override update(renderer: WebGLRenderer, inputBuffer: WebGLRenderTarget, deltaTime: number) {
		// this._composer1.render();
		this._composerInput1.render(deltaTime);

		// const texture1 = this.uniforms.get('texture1');
		// if (texture1) {
		// 	texture1.value = this._composer1.outputBuffer;
		// } else {
		// 	console.warn('missing texture1');
		// }
		const textureInput1 = this.uniforms.get('textureInput1');
		if (textureInput1) {
			// TODO: why does it work with inputBuffer and not outputBuffer ?
			(textureInput1.value as Texture) = this._composerInput1.inputBuffer.texture;
		} else {
			console.warn('missing texture2');
		}

		super.update(renderer, inputBuffer, deltaTime);
	}
	override setSize(width: number, height: number) {
		super.setSize(width, height);
		this._composerInput1.setSize(width, height, false);
	}
}
