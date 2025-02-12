import axios from "axios";

/**
 * Sends a request to ping the given IP address.
 * @param ip - The IP address to ping.
 * @returns A Promise that resolves if the IP is reachable.
 */
export const pingIp = async (ip: string): Promise<string> => {
    try {
        const response = await axios.get(`https://${ip}/ping`);
        if (response.status === 200) {
            return "IP is reachable";
        }
        throw new Error("Ping failed");
    } catch (error) {
        throw new Error("IP is not responding");
    }
};

/**
 * Uploads a file to the given IP's server with progress tracking.
 * @param ip - The IP address of the server to upload to.
 * @param file - The file to upload.
 * @param onUploadProgress - Callback function to update progress.
 * @returns A Promise that resolves when the upload is complete.
 */
export const uploadFile = async (ip: string, file: File, onUploadProgress: (progress: number) => void): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(`https://${ip}/upload`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                    onUploadProgress(progress);
                }
            },
        });

        return response.data.message || "Upload successful!";
    } catch (error) {
        throw new Error("Upload failed. Try again.");
    }
};
