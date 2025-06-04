import React from "react";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { X } from "lucide-react";
import VideoCard from "../video-card";

interface TranscriptDialogProps {
  open: boolean;
  onClose: () => void;
  videoUrl: string;
  videoTitle: string;
  videoThumbnail: string;
  transcriptContent: string;
}

export function TranscriptDialog({
  open,
  onClose,
  videoUrl,
  videoTitle,
  videoThumbnail,
  transcriptContent,
}: TranscriptDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        style: {
          borderRadius: "30px",
          padding: "20px",
          width: "90vw",
          maxWidth: "1200px",
          minWidth: "800px",
          height: "auto",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle>
        <div className="flex justify-end items-center">
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <X />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent className="p-6 lg:p-10 gap-0 overflow-auto">
        <div className="flex flex-row gap-6 p-6">
          <div className="w-[300px] shrink-0">
            <VideoCard
              id={1}
              url={videoUrl}
              thumbnail={videoThumbnail}
              title={videoTitle}
              transcript={transcriptContent}
              hideTranscriptButton={true}
              brandName=""
            />
          </div>
          <div className="flex gap-6 flex-1">
            <div className="w-[1px] bg-black rounded-full" />
            <div className="flex-1 text-muted-foreground leading-relaxed">
              {transcriptContent}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
