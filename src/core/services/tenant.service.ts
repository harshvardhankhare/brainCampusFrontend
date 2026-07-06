
export const getTenant = () => {
    const hostname = window.location.hostname;
    // Local development
    if (hostname === "localhost" || hostname === "127.0.0.1") {
        return "demo";
    }

    return hostname.split(".")[0];
};