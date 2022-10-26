vec3 rayDir = normalize(reflect(rayDir, n));
EnvMapProps envMapProps;
envMapProps.tint = __envMapTint__;
envMapProps.intensity = __envMapIntensity__;
envMapProps.roughness = __envMapRoughness__;
envMapProps.fresnel = __envMapFresnel__;
envMapProps.fresnelPower = __envMapFresnelPower__;
col += envMapSampleWithFresnel(rayDir, envMapProps, n, cameraPosition);