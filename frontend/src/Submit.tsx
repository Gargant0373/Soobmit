import { useState } from "react";
import { pingIp, uploadFile } from "./api";
import "./Submit.css";

enum Status {
    START,
    PINGING,
    UPLOADING,
    SUCCESS,
    FAILURE,
}

const randomMessages = [
    "Setting up cookie factory...",
    "Taking a break...",
    "Drinking a beer...",
    "Doing stuff... or something...",
    "Recalibrating quantum array...",
    "Feeding the hamsters...",
];

function getRandomMessage() {
    const index = Math.floor(Math.random() * randomMessages.length);
    return randomMessages[index];
}

function Submit() {
    const [ip, setIp] = useState("");
    const [status, setStatus] = useState(Status.START);
    const [files, setFiles] = useState<File[]>([]);
    const [progress, setProgress] = useState<{ [key: string]: number }>({});
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

    // New states for a SINGLE upload message and overall progress
    const [uploadMessage, setUploadMessage] = useState("");
    const [overallProgress, setOverallProgress] = useState(0);
    const [lastOverallProgress, setLastOverallProgress] = useState(0);
    const [lastMessageUpdateTime, setLastMessageUpdateTime] = useState(Date.now());

    const uploadScreen = () => {
        switch (status) {
            case Status.START:
            case Status.PINGING:
                return false;
            case Status.UPLOADING:
            case Status.SUCCESS:
            case Status.FAILURE:
                return true;
        }
    };

    const handleSubmit = async () => {
        if (status === Status.PINGING) return;
        setStatus(Status.PINGING);
        try {
            await pingIp(ip);
            setStatus(Status.SUCCESS);
            // Optionally reset the message & progress states
            setUploadMessage(getRandomMessage());
            setOverallProgress(0);
            setLastOverallProgress(0);
            setLastMessageUpdateTime(Date.now());
        } catch (error) {
            setStatus(Status.START);
            alert("IP is not reachable");
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFiles(Array.from(event.target.files));
        }
    };

    const calculateOverallProgress = (newProgress: { [key: string]: number }) => {
        if (files.length === 0) return 0;
        const totalBytes = files.reduce((acc, file) => acc + file.size, 0);

        let uploadedBytes = 0;
        for (const file of files) {
            const fileProgressPercent = newProgress[file.name] || 0;
            const fileUploadedBytes = (file.size * fileProgressPercent) / 100;
            uploadedBytes += fileUploadedBytes;
        }

        const overall = (uploadedBytes / totalBytes) * 100;
        return Math.floor(overall);
    };

    const updateUploadMessageIfNeeded = (newOverallProgress: number) => {
        const now = Date.now();
        const timeDiff = now - lastMessageUpdateTime;
        const progressDiff = newOverallProgress - lastOverallProgress;

        const hasCrossedFivePercent = progressDiff >= 5;
        const hasThreeSecondsPassed = timeDiff >= 3000;

        if (hasCrossedFivePercent || hasThreeSecondsPassed) {
            setUploadMessage(getRandomMessage());
            setLastMessageUpdateTime(now);
            setLastOverallProgress(newOverallProgress);
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            alert("No files selected.");
            return;
        }

        setStatus(Status.UPLOADING);

        let newUploadedFiles: string[] = [];

        for (const file of files) {
            try {
                await uploadFile(ip, file, (progressValue) => {
                    setProgress((prev) => {
                        const updated = { ...prev, [file.name]: progressValue };
                        const overall = calculateOverallProgress(updated);
                        setOverallProgress(overall);
                        updateUploadMessageIfNeeded(overall);
                        return updated;
                    });
                });

                newUploadedFiles.push(file.name);
            } catch (error) {
                alert(`File upload failed: ${file.name}`);
            }
        }

        setUploadedFiles((prevFiles) => [...prevFiles, ...newUploadedFiles]);
        setFiles([]);
        setProgress({});
        setOverallProgress(100);
        updateUploadMessageIfNeeded(100);
        setStatus(Status.SUCCESS);
    };

    const removeFile = (file: File) => {
        setFiles((prevFiles) => prevFiles.filter((f) => f !== file));
    }

    return (
        <>
            <div className="title">
                {"SOOBMIT".split("").map((char, index) => (
                    <span key={index} className={`char-${index} animated-char`}>
                        {char}
                    </span>
                ))}
            </div>

            {!uploadScreen() && (
                <div className="form">
                    <input
                        type="text"
                        value={ip}
                        onChange={(e) => setIp(e.target.value)}
                        placeholder="Enter IP address"
                    />
                    <button onClick={handleSubmit} disabled={Status.PINGING === status}>
                        {Status.PINGING === status ? "LOADING" : "SUBMIT"}
                    </button>
                </div>
            )}

            {uploadScreen() && (
                <div className="upload">
                    <input id="file-upload" type="file" multiple onChange={handleFileChange} />
                    <label htmlFor="file-upload">SELECT FILES</label>

                    {files.length > 0 && (
                        <div className="selected-files">
                            <p>Selected Files:</p>
                            <ul>
                                {files.map((file, index) => (
                                    <li onClick={() => removeFile(file)} key={index}>{file.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {files.length > 0 && <button onClick={handleUpload}>UPLOAD</button>}

                    {status === Status.UPLOADING ? (
                        <div className="progress-container">
                            <div className="progress-wrapper">
                                <div className="progress-bar">
                                    <div className="progress">
                                        Overall Progress: {overallProgress}%
                                    </div>
                                </div>
                            </div>
                            <p style={{ marginTop: 10 }}>
                                {uploadMessage || "Preparing upload..."}
                            </p>
                        </div>
                    ) : null}

                    {uploadedFiles.length > 0 && (
                        <div className="uploaded-files">
                            <h3>Uploaded Files</h3>
                            <ul>
                                {uploadedFiles.map((filename, index) => (
                                    <li key={index}>{filename}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default Submit;
