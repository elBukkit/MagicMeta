function addMultiples(value, values, decimalLimit) {
    if (!$.isNumeric(value)) return;
    values[value * 2] = null;
    values[value * 10] = null;
    let lessValue = value;
    while (decimalLimit >= 0) {
        lessValue /= 2;
        values[Math.floor(lessValue)] = null;
        if (lessValue < 1) decimalLimit--;
    }
    lessValue = value;
    while (decimalLimit >= 0) {
        lessValue /= 10;
        values[Math.floor(lessValue)] = null;
        if (lessValue < 1) decimalLimit--;
    }
}

function addPowersOfTen(value, values) {
    if (!$.isNumeric(value)) return;
    for (let i = 0; i < 3; i++) {
        value *= 10;
        values[value] = null;
    }
}

function RGBToHSV(hex) {
    // Remove quotes
    hex = hex.substring(1, hex.length - 1);

    // Get the RGB values to calculate the Hue.
    let r = parseInt(hex.substring(0,2),16)/255;
    let g = parseInt(hex.substring(2,4),16)/255;
    let b = parseInt(hex.substring(4,6),16)/255;

    // Getting the Max and Min values for Chroma.
    let max = Math.max.apply(Math, [r,g,b]);
    let min = Math.min.apply(Math, [r,g,b]);

    // Variables for HSV value of hex color.
    let chr = max-min;
    let hue = 0;
    let val = max;
    let sat = 0;

    if (val > 0) {
        // Calculate Saturation only if Value isn't 0.
        sat = chr/val;
        if (sat > 0) {
            if (r == max) {
                hue = 60*(((g-min)-(b-min))/chr);
                if (hue < 0) {hue += 360;}
            } else if (g == max) {
                hue = 120+60*(((b-min)-(r-min))/chr);
            } else if (b == max) {
                hue = 240+60*(((r-min)-(g-min))/chr);
            }
        }
    }

    return [hue, sat, val];
}

function trimTags(description) {
    if (description == null) return description;
    let index = description.lastIndexOf('>');
    if (index > 0 && index < description.length - 1) {
        description = description.substring(index + 1);
    }

    return description;
}