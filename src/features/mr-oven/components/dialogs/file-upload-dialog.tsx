"use client";

import * as React from "react";
import { ArrowRight, MoveRight, Upload, X } from "lucide-react";
import { Button } from "../../../../components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../../../../components/ui/dialog";

import { uploadSingleVideo, uploadVideos } from "../../utils/api";
import { Toastify } from "../../../../packages/ui/src/toast";

interface FileWithPreview extends File {
  preview?: string;
}

interface FileUploadDialogProps {
  open: boolean;
  onClose: () => void;
  fetchVideos: () => void;
}

// Removing the file size limit
// const MAX_TOTAL_SIZE = 90 * 1024 * 1024;

export function FileUploadDialog({
  open,
  onClose,
  fetchVideos,
}: FileUploadDialogProps) {
  const [files, setFiles] = React.useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [totalSize, setTotalSize] = React.useState(0);
  // Removed size exceeded state
  // const [sizeExceeded, setSizeExceeded] = React.useState(false);

  // Calculate total size without limit checking
  React.useEffect(() => {
    const newTotalSize = files.reduce((sum, file) => sum + file.size, 0);
    setTotalSize(newTotalSize);
    // Removed size limit check
    // setSizeExceeded(newTotalSize > MAX_TOTAL_SIZE);
  }, [files]);

  const onDrop = React.useCallback((acceptedFiles: FileWithPreview[]) => {
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles, ...acceptedFiles];
      // No size limit check
      return newFiles;
    });
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "video/mp4"
    );
    onDrop(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(
        (file) => file.type === "video/mp4"
      );

      // Add files without size limit check
      onDrop(selectedFiles);

      // Reset the input value to allow selecting the same file again
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const onCloseHandler = () => {
    setFiles([]);
    setTotalSize(0);
    // Removed setSizeExceeded(false);
    onClose();
  };

  const prepareFilesForUpload = (files: FileWithPreview[]) => {
    return files.map((file, index) => {
      const isDuplicate =
        files.findIndex((f) => f.name === file.name) !== index;

      if (isDuplicate) {
        const nameParts = file.name.split(".");
        const extension = nameParts.pop();
        const baseName = nameParts.join(".");
        const timestamp = new Date().getTime();
        const newName = `${baseName}_${timestamp}.${extension}`;

        const modifiedFile = new File([file], newName, { type: file.type });
        if (file.preview) {
          (modifiedFile as FileWithPreview).preview = file.preview;
        }
        return modifiedFile;
      }

      return file;
    });
  };

  // Format size for display
  const formatSize = (sizeInBytes: number) => {
    return (sizeInBytes / (1024 * 1024)).toFixed(1) + "MB";
  };

  return (
    <Dialog open={open} onOpenChange={onCloseHandler}>
      <DialogContent
        className="sm:max-w-[800px]"
        style={{
          fontFamily: "Outfit",
        }}
      >
        <div
          className={`mt-4 rounded-lg border-2 border-dashed p-14 text-center ${
            isDragging ? "border-primary bg-primary/10" : "border-muted"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="mx-auto h-12 w-12 text-muted-foreground">
            <img src="/assets/feather_upload-cloud.png" alt="" />
          </div>
          <p
            className="mt-2 text-xl text-muted-foreground"
            style={{ fontFamily: "Outfit" }}
          >
            Select a video (mp4) file or drag and drop here
          </p>
          <p
            className="mt-1 text-sm text-muted-foreground"
            style={{ fontFamily: "Outfit" }}
          >
            No file size limit
          </p>
          <label htmlFor="file-upload" className="mt-4 inline-block">
            <Button
              variant="secondary"
              size="sm"
              className="relative"
              style={{
                backgroundColor: "transparent",
                color: "#3A8165",
                border: "1px solid #3A8165",
                fontSize: "1.15rem",
                fontFamily: "Outfit",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "0.2rem 1.5rem",
                borderRadius: "10rem",
                minWidth: "2rem",
                fontWeight: 400,
              }}
            >
              SELECT VIDEO
              <input
                id="file-upload"
                type="file"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={handleFileSelect}
                multiple
                accept=".mp4"
              />
            </Button>
          </label>
        </div>

        {files.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h4
                className="text-sm font-medium"
                style={{ fontFamily: "Outfit" }}
              >
                {files.length > 1 ? "Videos added" : "Video added"}
              </h4>
              <div
                className="text-sm text-gray-500"
                style={{ fontFamily: "Outfit" }}
              >
                Total: {formatSize(totalSize)}
              </div>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 shrink-0 rounded-md border bg-muted" />
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ fontFamily: "Outfit" }}
                      >
                        {file.name}
                      </p>
                      <p
                        className="text-xs text-muted-foreground"
                        style={{ fontFamily: "Outfit" }}
                      >
                        {formatSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-3">
          <Button
            className="flex justify-center items-center"
            style={{
              color: "white",
              fontSize: "1.2rem",
              fontFamily: "Outfit",
              borderRadius: "10rem",
              fontWeight: 400,
              backgroundColor: files.length === 0 ? "#B3B3B3" : "#3A8165",
            }}
            onClick={async () => {
              try {
                setIsUploading(true);
                const filesToUpload = prepareFilesForUpload(files);
                await uploadVideos(filesToUpload, [{ name: "demo" }]);
                Toastify("success", "Videos Uploaded Successfully");
                fetchVideos();
                setFiles([]);
                onClose();
              } catch (error) {
                console.error("Error uploading videos:", error);
                Toastify("error", "Failed to upload videos");
              } finally {
                setIsUploading(false);
              }
            }}
            disabled={files.length === 0 || isUploading}
          >
            {isUploading ? (
              "UPLOADING..."
            ) : (
              <>
                CONTINUE <MoveRight size={64} />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}