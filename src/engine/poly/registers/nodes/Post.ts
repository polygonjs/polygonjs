import {CATEGORY_POST} from './Category';

// import {AdaptiveToneMappingPostNode} from '../../../nodes/post/AdaptiveToneMapping';
// import {AfterImagePostNode} from '../../../nodes/post/AfterImage';
import {AntialiasingPostNode} from '../../../nodes/post/Antialiasing';
import {BloomPostNode} from '../../../nodes/post/Bloom';
import {BlurPostNode} from '../../../nodes/post/Blur';
import {BrightnessContrastPostNode} from '../../../nodes/post/BrightnessContrast';
import {ChromaticAberrationPostNode} from '../../../nodes/post/ChromaticAberration';
// import {ClearPostNode} from '../../../nodes/post/Clear';
// import {ClearMaskPostNode} from '../../../nodes/post/ClearMask';
// import {ColorCorrectionPostNode} from '../../../nodes/post/ColorCorrection';
// import {CopyPostNode} from '../../../nodes/post/Copy';
import {DepthOfFieldPostNode} from '../../../nodes/post/DepthOfField';
// import {DotScreenPostNode} from '../../../nodes/post/DotScreen';
import {EffectPassPostNode} from '../../../nodes/post/EffectPass';
// import {GammaCorrectionPostNode} from '../../../nodes/post/GammaCorrection';
import {GlitchPostNode} from '../../../nodes/post/Glitch';
import {GodRaysPostNode} from '../../../nodes/post/GodRays';
import {HueSaturationPostNode} from '../../../nodes/post/HueSaturation';
// import {LayerPostNode} from '../../../nodes/post/Layer';
// import {MaskPostNode} from '../../../nodes/post/Mask';
import {LutPostNode} from '../../../nodes/post/Lut';
import {NormalPostNode} from '../../../nodes/post/Normal';
import {NoisePostNode} from '../../../nodes/post/Noise';
import {NullPostNode} from '../../../nodes/post/Null';
import {OutlinePostNode} from '../../../nodes/post/Outline';
import {PixelPostNode} from '../../../nodes/post/Pixel';
import {RenderPostNode} from '../../../nodes/post/Render';
import {ScreenSpaceAmbientOcclusionPostNode} from '../../../nodes/post/ScreenSpaceAmbientOcclusion';
import {SepiaPostNode} from '../../../nodes/post/Sepia';
import {SequencePostNode} from '../../../nodes/post/Sequence';
import {TexturePostNode} from '../../../nodes/post/Texture';
import {UpdateScenePostNode} from '../../../nodes/post/UpdateScene';
import {VignettePostNode} from '../../../nodes/post/Vignette';
// networks../../../nodes/post/Blur
import {ActorsNetworkPostNode} from '../../../nodes/post/ActorsNetwork';
import {AnimationsNetworkPostNode} from '../../../nodes/post/AnimationsNetwork';
import {AudioNetworkPostNode} from '../../../nodes/post/AudioNetwork';
import {CopNetworkPostNode} from '../../../nodes/post/CopNetwork';
import {EventsNetworkPostNode} from '../../../nodes/post/EventsNetwork';
import {MaterialsNetworkPostNode} from '../../../nodes/post/MaterialsNetwork';
import {PostProcessNetworkPostNode} from '../../../nodes/post/PostProcessNetwork';
import {RenderersNetworkPostNode} from '../../../nodes/post/RenderersNetwork';

export interface PostNodeChildrenMap {
	// adaptiveToneMapping: AdaptiveToneMappingPostNode;
	// afterImage: AfterImagePostNode;
	antialiasing: AntialiasingPostNode;
	bloom: BloomPostNode;
	blur: BlurPostNode;
	brightnessContrast: BrightnessContrastPostNode;
	chromaticAberration: ChromaticAberrationPostNode;
	// clear: ClearPostNode;
	// clearMask: ClearMaskPostNode;
	// colorCorrection: ColorCorrectionPostNode;
	// copy: CopyPostNode;
	depthOfField: DepthOfFieldPostNode;
	// dotScreen: DotScreenPostNode;
	effectPass: EffectPassPostNode;
	// gammaCorrection: GammaCorrectionPostNode;
	glitch: GlitchPostNode;
	godRays: GodRaysPostNode;
	hueSaturation: HueSaturationPostNode;
	// layer: LayerPostNode;
	// mask: MaskPostNode;
	lut: LutPostNode;
	noise: NoisePostNode;
	normal: NormalPostNode;
	null: NullPostNode;
	outline: OutlinePostNode;
	pixel: PixelPostNode;
	render: RenderPostNode;
	screenSpaceAmbientOcclusionPostNode: ScreenSpaceAmbientOcclusionPostNode;
	sepia: SepiaPostNode;
	sequence: SequencePostNode;
	texture: TexturePostNode;
	updateScene: UpdateScenePostNode;
	vignette: VignettePostNode;
	// networks
	actorsNetwork: ActorsNetworkPostNode;
	animationsNetwork: AnimationsNetworkPostNode;
	audioNetwork: AudioNetworkPostNode;
	copNetwork: CopNetworkPostNode;
	eventsNetwork: EventsNetworkPostNode;
	materialsNetwork: MaterialsNetworkPostNode;
	postProcessNetwork: PostProcessNetworkPostNode;
	renderersNetwork: RenderersNetworkPostNode;
}

import {PolyEngine} from '../../../Poly';
export class PostRegister {
	static run(poly: PolyEngine) {
		// poly.registerNode(AdaptiveToneMappingPostNode, CATEGORY_POST.EFFECT);
		// poly.registerNode(AfterImagePostNode, CATEGORY_POST.EFFECT);
		poly.registerNode(AntialiasingPostNode, CATEGORY_POST.EFFECT);
		poly.registerNode(BloomPostNode, CATEGORY_POST.EFFECT);
		poly.registerNode(BlurPostNode, CATEGORY_POST.BLUR);
		poly.registerNode(BrightnessContrastPostNode, CATEGORY_POST.COLOR);
		poly.registerNode(ChromaticAberrationPostNode, CATEGORY_POST.EFFECT);
		// poly.registerNode(ClearPostNode, CATEGORY_POST.MISC);
		// poly.registerNode(ClearMaskPostNode, CATEGORY_POST.MISC);
		// poly.registerNode(ColorCorrectionPostNode, CATEGORY_POST.MISC);
		// poly.registerNode(CopyPostNode, CATEGORY_POST.MISC);
		// poly.registerNode(DotScreenPostNode, CATEGORY_POST.EFFECT);
		poly.registerNode(DepthOfFieldPostNode, CATEGORY_POST.EFFECT);
		poly.registerNode(EffectPassPostNode, CATEGORY_POST.EFFECT);
		// poly.registerNode(GammaCorrectionPostNode, CATEGORY_POST.COLOR);
		poly.registerNode(GlitchPostNode, CATEGORY_POST.EFFECT);
		poly.registerNode(GodRaysPostNode, CATEGORY_POST.EFFECT);
		poly.registerNode(HueSaturationPostNode, CATEGORY_POST.COLOR);
		// poly.registerNode(LayerPostNode, CATEGORY_POST.MISC);
		// poly.registerNode(MaskPostNode, CATEGORY_POST.MISC);

		poly.registerNode(LutPostNode, CATEGORY_POST.COLOR);
		poly.registerNode(NoisePostNode, CATEGORY_POST.EFFECT);
		poly.registerNode(NormalPostNode, CATEGORY_POST.MISC);
		poly.registerNode(NullPostNode, CATEGORY_POST.MISC);
		poly.registerNode(OutlinePostNode, CATEGORY_POST.EFFECT);
		poly.registerNode(PixelPostNode, CATEGORY_POST.EFFECT);
		poly.registerNode(RenderPostNode, CATEGORY_POST.MISC);
		poly.registerNode(ScreenSpaceAmbientOcclusionPostNode, CATEGORY_POST.EFFECT);
		poly.registerNode(SepiaPostNode, CATEGORY_POST.COLOR);
		poly.registerNode(SequencePostNode, CATEGORY_POST.MISC);
		poly.registerNode(TexturePostNode, CATEGORY_POST.MISC);
		poly.registerNode(UpdateScenePostNode, CATEGORY_POST.ADVANCED);
		poly.registerNode(VignettePostNode, CATEGORY_POST.EFFECT);
		// netwoks
		poly.registerNode(ActorsNetworkPostNode, CATEGORY_POST.NETWORK);
		poly.registerNode(AnimationsNetworkPostNode, CATEGORY_POST.NETWORK);
		poly.registerNode(AudioNetworkPostNode, CATEGORY_POST.NETWORK);
		poly.registerNode(CopNetworkPostNode, CATEGORY_POST.NETWORK);
		poly.registerNode(EventsNetworkPostNode, CATEGORY_POST.NETWORK);
		poly.registerNode(MaterialsNetworkPostNode, CATEGORY_POST.NETWORK);
		poly.registerNode(PostProcessNetworkPostNode, CATEGORY_POST.NETWORK);
		poly.registerNode(RenderersNetworkPostNode, CATEGORY_POST.NETWORK);
	}
}
