vec3 rayDir = normalize(reflect(rayDir, n));
EnvMap envMap;
envMap.tint = __envMapTint__;
envMap.intensity = __envMapIntensity__;
envMap.fresnel = __envMapFresnel__;
envMap.fresnelPower = __envMapFresnelPower__;
col += envMapSampleWithFresnel(rayDir, __envMap__, envMap, n, cameraPosition);