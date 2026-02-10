export interface UserData {
    altura: number;
    peso: number;
    idade: number;
    toraxAdj: number;
    cinturaAdj: number;
    quadrilAdj: number;
}

export interface SuitSize {
    paleto: number;
    calca: number;
}

export function calculateSuitSize(data: UserData): SuitSize {
    let baseSize = 46;

    if (data.peso > 115) baseSize = 60;
    else if (data.peso > 105) baseSize = 58;
    else if (data.peso > 95) baseSize = 56;
    else if (data.peso > 85) baseSize = 54;
    else if (data.peso > 78) baseSize = 52;
    else if (data.peso > 70) baseSize = 50;
    else if (data.peso > 62) baseSize = 48;

    // Fine adjustment from sliders
    // Logic from original: if (formData.toraxAdj > 2) baseSize += 2;
    if (data.toraxAdj > 2) {
        baseSize += 2;
    }

    return {
        paleto: baseSize,
        calca: baseSize - 6 // Drop 6 standard
    };
}
