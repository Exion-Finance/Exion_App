export const getNetworkChannel = (phoneNumber: string): "Mpesa" | "Airtel" | "Unsupported" => {
    // Ensure it's a clean string (e.g. "254...")
    if (!phoneNumber.startsWith("254")) return "Unsupported";

    // SAFARICOM PREFIXES
    const safaricomPrefixes = [
        /^25470\d/, /^25471\d/, /^25472\d/, /^25474\d/,
        /^254757\d/, /^254758\d/, /^254759\d/,
        /^254768\d/, /^254769\d/,
        /^25479\d/,
        /^254110\d/, /^254111\d/, /^254112\d/,
        /^254113\d/, /^254114\d/, /^254115\d/
    ];

    // AIRTEL PREFIXES
    const airtelPrefixes = [
        /^25473\d/,
        /^254750\d/, /^254751\d/, /^254752\d/, /^254753\d/, /^254754\d/, /^254755\d/, /^254756\d/,
        /^254785\d/, /^254786\d/, /^254787\d/, /^254788\d/, /^254789\d/,
        /^254100\d/, /^254101\d/, /^254102\d/,
        /^254107\d/, /^254108\d/
    ];

    // Check each group
    if (safaricomPrefixes.some((regex) => regex.test(phoneNumber))) {
        return "Mpesa";
    }

    if (airtelPrefixes.some((regex) => regex.test(phoneNumber))) {
        return "Airtel";
    }

    return "Unsupported";
};
