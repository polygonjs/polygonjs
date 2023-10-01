import {Uniform, WebGLRenderer, WebGLRenderTarget, Texture} from 'three';
import {Effect, BlendFunction, EffectComposer} from 'postprocessing';
export {BlendFunction};
import {IUniforms} from '../../../../core/geometry/Material';

// import fragmentShader from '../gl/builder.glsl';

interface BuilderEffectOptions {
	fragmentShader: string;
	useOutputBuffer: boolean;
}

export class BuilderEffect extends Effect {
	constructor(private _composerInput1: EffectComposer, private options: BuilderEffectOptions) {
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
		for (const uniformName of uniformNames) {
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
			// TODO: test when it should work with inputBuffer or outputBuffer
			// as this could be automated (maybe depending on number of passes)
			(textureInput1.value as Texture) = this.options.useOutputBuffer
				? this._composerInput1.outputBuffer.texture
				: this._composerInput1.inputBuffer.texture;
		} else {
			console.warn('missing texture2');
		}

		super.update(renderer, inputBuffer, deltaTime);
	}
	override setSize(width: number, height: number) {
		super.setSize(width, height);
		// here we divide the size by renderer pixelRatio
		// since the composer is internally using it,
		// so we need here to compensate for it
		const pixelRatio = this._composerInput1.getRenderer().getPixelRatio();
		this._composerInput1.setSize(width / pixelRatio, height / pixelRatio, false);
	}
}
