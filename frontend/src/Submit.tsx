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

function Submit() {
    const [ip, setIp] = useState("");
    const [status, setStatus] = useState(Status.START);
    const [files, setFiles] = useState<File[]>([]);
    const [progress, setProgress] = useState<{ [key: string]: number }>({});
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

    const [uploadMessages, setUploadMessages] = useState<{ [filename: string]: string }>({});
    const [lastProgressThreshold, setLastProgressThreshold] = useState<{ [filename: string]: number }>({});
    const [lastMessageUpdateTime, setLastMessageUpdateTime] = useState<{ [filename: string]: number }>({});

    const randomMessages = [
        "Setting up cookie factory...",
        "Taking a break...",
        "Drinking a beer...",
        "Doing stuff... or something...",
        "Recalibrating quantum array...",
        "Feeding the hamsters..."
    ];

    function getRandomMessage() {
        return randomMessages[Math.floor(Math.random() * randomMessages.length)];
    }


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
            setStatus(Status.UPLOADING);
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

    const handleUpload = async () => {
        if (files.length === 0) {
            alert("No files selected.");
            return;
        }

        let newUploadedFiles: string[] = [];

        for (const file of files) {
            setLastProgressThreshold(prev => ({ ...prev, [file.name]: 0 }));
            setLastMessageUpdateTime(prev => ({ ...prev, [file.name]: Date.now() }));
        }

        for (const file of files) {
            try {
                await uploadFile(ip, file, (progressValue) => {
                    setProgress((prev) => ({ ...prev, [file.name]: progressValue }));
                });

                newUploadedFiles.push(file.name);
            } catch (error) {
                alert(`File upload failed: ${file.name}`);
            }
        }

        setUploadedFiles((prevFiles) => [...prevFiles, ...newUploadedFiles]);
        setFiles([]);
        setProgress({});
        setStatus(Status.SUCCESS);
    };

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
                        <div>
                            <p>Selected Files:</p>
                            <ul>
                                {files.map((file, index) => (
                                    <li key={index}>{file.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {files.length > 0 && (
                        <button onClick={handleUpload}>UPLOAD</button>
                    )}

                    {Object.keys(progress).length > 0 && (
                        <div className="progress-container">
                            {files.map((file) => (
                                <div key={file.name} className="progress-wrapper">
                                    <div className="progress-bar">
                                        <div className="progress">
                                            Uploading: {progress[file.name] || 0}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

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
