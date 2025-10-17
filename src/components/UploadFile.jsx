import React, { useRef, useState } from "react";
import "./UploadFile.css";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_EXT = /\.(pdf|txt|doc|docx|pptx)$/i;

const UploadFile = ({ onFileUpload }) => {
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  const openDialog = () => {
    if (inputRef.current) inputRef.current.click();
  };

  const validateAndSet = (file) => {
    setError("");
    if (!file) return;
    if (file.size > MAX_SIZE) {
      setError("File too large — maximum 10MB.");
      return;
    }
    if (
      !ACCEPTED_EXT.test(file.name) &&
      !file.type.includes("pdf") &&
      !file.type.includes("text") &&
      !file.type.includes("word")
    ) {
      setError("Unsupported file type. Use PDF, DOC, DOCX or TXT.");
      return;
    }
    setSelected(file);
    onFileUpload && onFileUpload(file);
  };

  const onChange = (e) => {
    validateAndSet(e.target.files[0]);
    e.target.value = null;
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    validateAndSet(f);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => setIsDragOver(false);

  return (
    <div className="upload-root">
      <div
        className="upload-card"
        role="region"
        aria-label="Upload study document"
      >
        <h2 className="upload-title">Upload Study Document</h2>

        <label
          className={`dropzone ${isDragOver ? "hover" : ""}`}
          onClick={openDialog}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <input
            ref={inputRef}
            className="file-input"
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={onChange}
            aria-hidden="true"
            hidden
          />

          <div className="drop-inner">
            <svg
              className="upload-icon"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M12 3v9"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 8l-4-4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div className="drop-text">
              {selected ? (
                <>
                  <div className="file-name">{selected.name}</div>
                  <div className="file-sub muted">
                    {(selected.size / 1024).toFixed(0)} KB
                  </div>
                </>
              ) : (
                <>
                  <div className="upload-line">
                    <strong>Upload a file</strong> or drag and drop
                  </div>
                  <div className="muted">PDF, DOC, DOCX, or TXT up to 10MB</div>
                </>
              )}
            </div>
          </div>
        </label>

        <div className="upload-actions">
          <button
            className="btn-primary"
            onClick={() => {
              if (selected) {
                onFileUpload && onFileUpload(selected);
              } else {
                openDialog();
              }
            }}
          >
            {selected ? "Upload Document" : "Choose File"}
          </button>

          {selected && (
            <button
              className="btn-ghost"
              onClick={() => {
                setSelected(null);
                setError("");
                // optionally inform parent that selection cleared
              }}
            >
              Remove
            </button>
          )}
        </div>

        {error && <div className="upload-error">{error}</div>}
      </div>
    </div>
  );
};

export default UploadFile;
