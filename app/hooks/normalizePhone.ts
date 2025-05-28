export const  normalizePhoneNumber =(phoneNumber: string): string=> {
    // Remove the country code +254 and replace with 0
    return phoneNumber.replace(/^\+254/, '0');
}