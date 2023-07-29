struct VATDataInfoBasic {
	float frame;
	float framesCount;
	vec2 paddedRatio;
	vec2 uv;
};

struct BoundingBox {
	float min;
	float max;
};
struct VATDataInfoInterpolated {
	float speed;
	BoundingBox Pbound;
	vec3 Poffset;
	VATDataInfoBasic infoBasic;
};
struct VATDataResult {
	vec3 P;
	vec3 N;
};

vec3 FitInBoundingBox(vec3 pos, BoundingBox box){
	float delta = box.max - box.min;
	pos *= delta;
	pos += box.min;
	return pos;
}

vec2 VATDataUv(VATDataInfoBasic info){
	// mod(<value>, 1.0) is required for iphone,
	// as texture will not wrap otherwise, even with wrapS and wrapT = THREE.RepeatWrapping
	float x = mod((info.paddedRatio.x * info.uv.x), 1.0);
	float y0 = 1.0 - info.paddedRatio.y * (1.0 - info.uv.y);
	float y1 = 1.0 - info.paddedRatio.y * (info.frame / info.framesCount);
	float y = mod((y0+y1), 1.0);
	return vec2(x, y);
}

vec3 VATDataP(vec2 uv, sampler2D mapP, sampler2D mapP2){
	vec3 P = texture2D(mapP, uv).xyz;
	vec3 P2 = texture2D(mapP2, uv).xyz * 0.01;
	return P + P2;
}
vec3 VATDataN(vec2 uv, sampler2D mapN){
	vec3 N = (texture2D(mapN, uv).xyz * 2.0) - 1.0;
	return normalize(N);
}


VATDataResult VATData(VATDataInfoBasic info, sampler2D mapP, sampler2D mapP2, sampler2D mapN){
	vec2 uvTmp = VATDataUv(info);
	vec3 P = VATDataP(uvTmp, mapP, mapP2);
	vec3 N = VATDataN(uvTmp, mapN);
	return VATDataResult(P,N);
}
VATDataResult VATDataInterpolated(VATDataInfoInterpolated info, sampler2D mapP, sampler2D mapP2, sampler2D mapN){
	float frameWithSpeed = info.speed * float(info.infoBasic.frame);
	float previousFrame = floor(frameWithSpeed);
	float nextFrame = ceil(frameWithSpeed);

	VATDataInfoBasic infoPreviousFrame = VATDataInfoBasic(
		previousFrame,
		info.infoBasic.framesCount,
		info.infoBasic.paddedRatio,
		info.infoBasic.uv
	);
	VATDataInfoBasic infoNextFrame = VATDataInfoBasic(
		nextFrame,
		info.infoBasic.framesCount,
		info.infoBasic.paddedRatio,
		info.infoBasic.uv
	);
	VATDataResult resultPreviousFrame = VATData(infoPreviousFrame, mapP, mapP2, mapN);
	VATDataResult resultNextFrame = VATData(infoNextFrame, mapP, mapP2, mapN);

	float blend = 1.0 - ( nextFrame - frameWithSpeed );

	vec3 P = mix(resultPreviousFrame.P, resultNextFrame.P, blend);
	P = FitInBoundingBox(P, info.Pbound) + info.Poffset;

	vec3 N = mix(resultPreviousFrame.N, resultNextFrame.N, blend);

	return VATDataResult(P,N);
}