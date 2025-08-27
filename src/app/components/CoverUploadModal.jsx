"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function CoverUploadModal({
  open,
  onClose,
  bookId,
  accessToken,
  API_BASE,
}) {
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);

  const [frontPreview, setFrontPreview] = useState("");
  const [backPreview, setBackPreview] = useState("");

  const [frontProgress, setFrontProgress] = useState(0);
  const [backProgress, setBackProgress] = useState(0);

  const [frontKey, setFrontKey] = useState("");
  const [backKey, setBackKey] = useState("");
  const [frontUrl, setFrontUrl] = useState("");
  const [backUrl, setBackUrl] = useState("");

  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  const MAX_MB = 10;
  const ACCEPTED = useMemo(() => ["image/jpeg", "image/png", "image/webp"], []);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setFrontFile(null);
      setBackFile(null);
      setFrontPreview("");
      setBackPreview("");
      setFrontProgress(0);
      setBackProgress(0);
      setFrontKey("");
      setBackKey("");
      setFrontUrl("");
      setBackUrl("");
      setMsg("");
      setSaving(false);
    }
  }, [open]);

  function pickFront() {
    frontInputRef.current?.click();
  }
  function pickBack() {
    backInputRef.current?.click();
  }

  function validateFile(file) {
    if (!file) return "No file selected.";
    if (!ACCEPTED.includes(file.type)) return "Only JPG, PNG, or WEBP allowed.";
    if (file.size > MAX_MB * 1024 * 1024) return `Max size ${MAX_MB} MB.`;
    return null;
  }

  function handleFrontChange(e) {
    const file = e.target.files?.[0];
    const error = validateFile(file);
    if (error) return setMsg(`❌ Front cover: ${error}`);
    setMsg("");
    setFrontFile(file);
    setFrontPreview(URL.createObjectURL(file));
    setFrontProgress(0);
  }

  function handleBackChange(e) {
    const file = e.target.files?.[0];
    const error = validateFile(file);
    if (error) return setMsg(`❌ Back cover: ${error}`);
    setMsg("");
    setBackFile(file);
    setBackPreview(URL.createObjectURL(file));
    setBackProgress(0);
  }

  // Drag & drop
  function makeDropHandler(which) {
    return (e) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer?.files?.[0];
      const error = validateFile(file);
      if (error) return setMsg(`❌ ${which === "front" ? "Front" : "Back"} cover: ${error}`);
      if (which === "front") {
        setFrontFile(file);
        setFrontPreview(URL.createObjectURL(file));
        setFrontProgress(0);
      } else {
        setBackFile(file);
        setBackPreview(URL.createObjectURL(file));
        setBackProgress(0);
      }
      setMsg("");
    };
  }
  function prevent(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // === API helpers ===

  // Your presign returns: { uploadUrl, fileUrl, key }
  async function getPresignedUrl(file, tag) {
    const fileName = `${tag}-${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const body = {
      fileName,
      fileType: file.type,
      folder: `books/${bookId}/covers`,
    };

    const res = await fetch(`${API_BASE}/s3/presign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => ({}));
    console.log("Presign response:", json);

    if (!res.ok || !json?.uploadUrl || !json?.key) {
      throw new Error(json?.message || "Failed to get presigned URL.");
    }
    return /** @type {{uploadUrl:string; fileUrl?:string; key:string}} */ (json);
  }

  // PUT the raw file to S3 using the presigned uploadUrl
  function putToS3({ uploadUrl, file, onProgress }) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type); // MUST match presigned type

      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable && typeof onProgress === "function") {
          const pct = Math.round((evt.loaded / evt.total) * 100);
          onProgress(pct);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve(true);
        else reject(new Error(`S3 upload failed (${xhr.status})`));
      };
      xhr.onerror = () => reject(new Error("Network error during S3 upload."));
      xhr.send(file);
    });
  }

  async function uploadOne(which) {
    try {
      const file = which === "front" ? frontFile : backFile;
      if (!file) return null;

      const presign = await getPresignedUrl(file, which); // { uploadUrl, fileUrl, key }
      await putToS3({
        uploadUrl: presign.uploadUrl,
        file,
        onProgress: which === "front" ? setFrontProgress : setBackProgress,
      });

      if (which === "front") {
        setFrontKey(presign.key);
        if (presign.fileUrl) setFrontUrl(presign.fileUrl);
      } else {
        setBackKey(presign.key);
        if (presign.fileUrl) setBackUrl(presign.fileUrl);
      }

      return presign.key;
    } catch (err) {
      setMsg(`❌ ${which === "front" ? "Front" : "Back"} upload: ${err.message}`);
      throw err;
    }
  }

  async function handleSave() {
    setMsg("");
    if (!bookId) return setMsg("❌ Missing bookId.");
    if (!API_BASE) return setMsg("❌ API_BASE missing.");
    if (!accessToken) return setMsg("❌ Please login first.");
  
    setSaving(true);
    try {
      // Upload selected files
      const uploadedFrontKey = frontFile ? await uploadOne("front") : frontKey || null;
      const uploadedBackKey  = backFile  ? await uploadOne("back")  : backKey  || null;
  
      if (!uploadedFrontKey && !uploadedBackKey) {
        setMsg("ℹ️ Nothing to save.");
        setSaving(false);
        return;
      }
  
      // Persist to your backend
      const res = await fetch(`${API_BASE}/books/${bookId}/covers`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          frontCoverKey: uploadedFrontKey || undefined,
          backCoverKey: uploadedBackKey  || undefined,
        }),
      });
  
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || `Save failed (${res.status})`);
  
      setMsg("✅ Covers saved.");
  
      // ✅ Auto-close after short delay
      setTimeout(() => {
        onClose();   // close modal
      }, 800);
  
    } catch (err) {
      setMsg(`❌ ${err.message || "Unexpected error."}`);
    } finally {
      setSaving(false);
    }
  }
  

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-gray-900 shadow-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Upload Book Covers</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Recommended: 1:1.6 portrait ratio (e.g., 1600×2560), under {MAX_MB} MB, JPG/PNG/WEBP.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm border hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Close
          </button>
        </div>

        {msg && (
          <div
            className={`mb-4 rounded border px-3 py-2 text-sm ${
              msg.startsWith("✅")
                ? "border-green-200 bg-green-50 text-green-700"
                : msg.startsWith("ℹ️")
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {msg}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {/* FRONT COVER */}
          <section
            onDrop={makeDropHandler("front")}
            onDragOver={prevent}
            onDragEnter={prevent}
            className="rounded-xl border-2 border-dashed p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Front Cover</h3>
              <button
                type="button"
                onClick={() => {
                  setFrontFile(null);
                  setFrontPreview("");
                  setFrontProgress(0);
                  setFrontKey("");
                  setFrontUrl("");
                }}
                className="text-xs px-2 py-1 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Clear
              </button>
            </div>

            <div className="aspect-[1/1.6] w-full bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
              {frontPreview ? (
                <img
                  src={frontPreview}
                  alt="Front cover preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4 text-gray-500">
                  Drop image here or
                  <button onClick={pickFront} className="ml-1 underline">
                    browse
                  </button>
                </div>
              )}
            </div>

            <input
              ref={frontInputRef}
              type="file"
              accept={ACCEPTED.join(",")}
              onChange={handleFrontChange}
              className="hidden"
            />

            {frontProgress > 0 && (
              <div className="mt-3">
                <div className="h-2 w-full bg-gray-200 rounded">
                  <div
                    className="h-2 bg-blue-600 rounded"
                    style={{ width: `${frontProgress}%` }}
                  />
                </div>
                <p className="text-xs mt-1 text-gray-600">{frontProgress}%</p>
              </div>
            )}
          </section>

          {/* BACK COVER */}
          <section
            onDrop={makeDropHandler("back")}
            onDragOver={prevent}
            onDragEnter={prevent}
            className="rounded-xl border-2 border-dashed p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Back Cover</h3>
              <button
                type="button"
                onClick={() => {
                  setBackFile(null);
                  setBackPreview("");
                  setBackProgress(0);
                  setBackKey("");
                  setBackUrl("");
                }}
                className="text-xs px-2 py-1 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Clear
              </button>
            </div>

            <div className="aspect-[1/1.6] w-full bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
              {backPreview ? (
                <img
                  src={backPreview}
                  alt="Back cover preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4 text-gray-500">
                  Drop image here or
                  <button onClick={pickBack} className="ml-1 underline">
                    browse
                  </button>
                </div>
              )}
            </div>

            <input
              ref={backInputRef}
              type="file"
              accept={ACCEPTED.join(",")}
              onChange={handleBackChange}
              className="hidden"
            />

            {backProgress > 0 && (
              <div className="mt-3">
                <div className="h-2 w-full bg-gray-200 rounded">
                  <div
                    className="h-2 bg-blue-600 rounded"
                    style={{ width: `${backProgress}%` }}
                  />
                </div>
                <p className="text-xs mt-1 text-gray-600">{backProgress}%</p>
              </div>
            )}
          </section>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {saving ? "Saving…" : "Upload & Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
