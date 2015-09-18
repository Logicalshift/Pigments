//
// Pigment
//

module Pigment {
    var pow = Math.pow;

    export var defaultDecodingGamma = 2.2;
    export var defaultEncodingGamma = 1/defaultDecodingGamma;

    //
    // Returns the result of translating the specified value using the basic gamma function
    //
    // Most values we use have a linear response to make calculations easier: however, computer displays
    // have a non-linear 'gamma' value, which reflects the logarithmic responsiveness of the human eye.
    // This increases the amount of information that can be conveyed on the screen (ensuring that colours
    // with different RGB values look different in reality)
    //
    // It turns out that floating point values, which we use to represent colour values, already have this
    // non-linearity of precision built in, so there's no need to represent light in a non-linear fashion
    // until it's time to actually generate an RGB hex value. This function is used to convert from these
    // linear values to the non-linear values used by the tool.
    //
    // Most computer displays are calibrated with a gamma factor of 2.2: this is the factor used to convert
    // from the value of the colour on screen to the linear value. To convert the other way - the typical
    // case when using this library - the inverse value should be used, that is 1/2.2 or ~0.45.
    //
    export function gamma(value: number, factor: number) {
        return pow(value, factor);
    }
}
