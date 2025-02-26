uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;

attribute float aSize;
attribute float aTimeMultipliers;

float remap(float value, float originMin, float originMax, float destinationMin, float destinationMax)
{
    return destinationMin + (value - originMin) * (destinationMax - destinationMin) / (originMax - originMin);
}

void main(){

    float progress = uProgress * aTimeMultipliers;

    vec3 displacementPosition = position;

    // Exploding
    float explodingProgress = remap(progress, 0.0, 0.1, 0.0, 1.0);
    explodingProgress = clamp(explodingProgress, 0.0, 1.0);
    explodingProgress = 1.0 - pow((1.0 - explodingProgress), 3.0);
    displacementPosition *= explodingProgress;

    // Falling
    float fallingProgress = remap(progress, 0.1, 1.0, 0.0, 1.0);
    fallingProgress = clamp(fallingProgress, 0.0, 1.0);
    fallingProgress = 1.0 - pow((1.0 - fallingProgress), 3.0);
    displacementPosition.y -= fallingProgress * 0.2;

    // Scaling 
    float sizeOpingProgress = remap(progress, 0.0, 0.125, 0.0, 1.0);
    float sizeCloseProgress = remap(progress, 0.125, 1.0, 1.0, 0.0);
    float sizeProgress = min(sizeOpingProgress,sizeCloseProgress);
    sizeProgress = clamp(sizeProgress, 0.0, 1.0);

    // Twinking
    float twinkingProgress = remap(progress, 0.2, 0.8, 0.0, 1.0);
    twinkingProgress = clamp(twinkingProgress, 0.0, 1.0);

    float sizeTwinking = sin(progress * 30.0) * 0.5 + 0.5;
    sizeTwinking = 1.0 - sizeTwinking * twinkingProgress;

    vec4 modelPosition = modelMatrix * vec4(displacementPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    gl_PointSize = uSize * uResolution.y * aSize * sizeProgress * sizeTwinking;
    gl_PointSize *= (1.0 / -viewPosition.z);

    if(gl_PointSize < 1.0)
    {
        gl_Position = vec4(0.0);
    }
}