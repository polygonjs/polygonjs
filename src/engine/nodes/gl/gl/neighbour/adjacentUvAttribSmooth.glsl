
float __SUB_FUNCTION__NAME__(
	vec2 particleUv,
	vec2 textureSize,
	sampler2D textureAttribute,
	float currentAttributeValue,
	float deltaThreshold,
	float smoothAmount,
	vec2 textureOffset
){
	float otherAttribute = texture2D(
		textureAttribute,
		particleUv + (textureOffset / textureSize)
	).__COMPONENT_ATTRIB__;

	float dist = 1.;
	float delta = (otherAttribute - currentAttributeValue) / dist;

	float excess = abs(delta) - deltaThreshold;

	return excess > 0.0 ? (excess * smoothAmount * sign(delta)) : 0.;
}

float __FUNCTION__NAME__(
	vec2 particleUv,
	vec2 textureSize,
	// attribSmooth
	sampler2D textureAttribute,
	float currentAttributeValue,
	float deltaThreshold,
	float smoothAmount
	){

	float offset = __SUB_FUNCTION__NAME__( particleUv, textureSize, textureAttribute, currentAttributeValue, deltaThreshold, smoothAmount, vec2(-1., 0.));
	offset += __SUB_FUNCTION__NAME__( particleUv, textureSize, textureAttribute, currentAttributeValue, deltaThreshold, smoothAmount, vec2(-1., -1.));
	offset += __SUB_FUNCTION__NAME__( particleUv, textureSize, textureAttribute, currentAttributeValue, deltaThreshold, smoothAmount, vec2(0., -1.));
	offset += __SUB_FUNCTION__NAME__( particleUv, textureSize, textureAttribute, currentAttributeValue, deltaThreshold, smoothAmount, vec2(1., -1.));
	offset += __SUB_FUNCTION__NAME__( particleUv, textureSize, textureAttribute, currentAttributeValue, deltaThreshold, smoothAmount, vec2(1., 0.));
	offset += __SUB_FUNCTION__NAME__( particleUv, textureSize, textureAttribute, currentAttributeValue, deltaThreshold, smoothAmount, vec2(1., -1.));
	offset += __SUB_FUNCTION__NAME__( particleUv, textureSize, textureAttribute, currentAttributeValue, deltaThreshold, smoothAmount, vec2(0., -1.));
	offset += __SUB_FUNCTION__NAME__( particleUv, textureSize, textureAttribute, currentAttributeValue, deltaThreshold, smoothAmount, vec2(-1., -1.));

	return currentAttributeValue + offset;
}