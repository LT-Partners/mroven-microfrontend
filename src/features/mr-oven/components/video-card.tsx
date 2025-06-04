import React from "react";
import ReactPlayer from "react-player";
import { Check, Play, Info } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";
import { TranscriptDialog } from "./dialogs/transcript-dialog";
import { Dialog, DialogContent, DialogTitle } from "../../../components/ui/dialog";
import { useState } from "react";
// Define the color rotation array for brands
const BRAND_COLORS = [
  { bg: "#F7CDAF", text: "#FF7056", border: "#FF7056" },
  { bg: "#D8EDFF", text: "#16306D", border: "#16306D" },
  { bg: "#FFF7D8", text: "#15306D", border: "#15306D" },
];

interface VideoMetadata {
  [key: string]: string | number | boolean | null;
}

interface VideoCardProps {
  id: number;
  url: string;
  brandName: string;
  thumbnail: string;
  title: string;
  description?: string;
  transcript?: string;
  className?: string;
  onSelect?: (selected: boolean) => void;
  isSelected?: boolean;
  video_metadata?: VideoMetadata;
  created_at?: string;
  brand_id?: number;
  hideTranscriptButton?: boolean;
  showBrandName?: boolean;
}

export default function VideoCard({
  id,
  showBrandName,
  brandName,
  url,
  thumbnail,
  title,
  description,
  transcript,
  className,
  onSelect,
  isSelected = false,
  video_metadata,
  created_at,
  brand_id,
  hideTranscriptButton = false,
}: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Format date to a readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only toggle selection, never start playing the video
    onSelect?.(!isSelected);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click handler from firing
    setIsPlaying(true);
  };

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click handler from firing
    setShowDetails(true);
  };

  return (
    <div
      className={cn(
        "p-2 group relative w-full rounded-lg transition-all duration-200 hover:shadow-lg cursor-pointer",
        className
      )}
    >
      <div
        className="relative aspect-[9/16] w-full bg-muted rounded-lg overflow-hidden"
        onClick={handleCardClick}
      >
        {/* Selection indicator - only shown when selected */}
        {isSelected && (
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-[#3A8165] hover:bg-[#3e6359] flex justify-center items-center shadow-[0_2px_8px_rgba(0,0,0,0.25)] backdrop-blur-sm">
              <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
          </div>
        )}

        {isPlaying ? (
          <ReactPlayer
            url={url}
            width="100%"
            height="100%"
            playing={true}
            controls={true}
            onEnded={() => setIsPlaying(false)}
          />
        ) : (
          <div className="relative w-full h-full">
            <img
              src={thumbnail || "/placeholder.svg"}
              alt={title}
              className="w-full h-full object-cover"
            />
            <Button
              size="icon"
              variant="secondary"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white h-8 w-8 sm:h-12 sm:w-12 z-10"
              onClick={handlePlayClick}
            >
              <Play className="h-4 w-4 sm:h-6 sm:w-6 fill-current text-gray-800" />
            </Button>
          </div>
        )}
      </div>
      <div className="mt-2 sm:mt-3 px-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {showBrandName && (
              <p
                className="w-fit rounded-[5px] pl-2 pr-2 pt-1 flex justify-center items-center mb-2 text-sm font-bold"
                style={{
                  backgroundColor:
                    BRAND_COLORS[brand_id % BRAND_COLORS.length].bg,
                  color: BRAND_COLORS[brand_id % BRAND_COLORS.length].text,
                  border: `2px dotted ${BRAND_COLORS[brand_id % BRAND_COLORS.length].border}`,
                }}
              >
                <span>{brandName.toUpperCase()}</span>
              </p>
            )}
            <h3 className="font-medium text-sm sm:text-base line-clamp-1">
              {title}
            </h3>
            {description && (
              <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {description || (video_metadata?.name as string) || ""}
              </p>
            )}
          </div>
          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
            {!hideTranscriptButton && (
              <>
                {transcript && (
                  <div
                    className="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8 rounded-full cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the card click handler from firing
                      setShowTranscript(true);
                    }}
                    title="View Transcript"
                  >
                    <img
                      src="/assets/transcript-filled.png"
                      alt="Transcript"
                      style={{ height: "100%", width: "100%" }}
                    />
                  </div>
                )}

                <div
                  className="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200"
                  onClick={handleInfoClick}
                  title="Video Details"
                >
                  <Info className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Transcript Dialog */}
      {showTranscript && transcript && (
        <TranscriptDialog
          open={showTranscript}
          onClose={() => setShowTranscript(false)}
          transcriptContent={transcript}
          videoTitle={title}
          videoUrl={url}
          videoThumbnail={thumbnail}
        />
      )}

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6">
          <DialogTitle className="text-lg sm:text-xl font-medium">
            {title}
          </DialogTitle>

          <div className="mt-4">
            <div className="aspect-video w-full overflow-hidden rounded-md">
              <ReactPlayer
                url={url}
                width="100%"
                height="100%"
                controls={true}
              />
            </div>
          </div>

          <div className="mt-4 space-y-4 overflow-y-auto flex-grow pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                  Video ID
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">{id}</p>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                  Brand ID
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {brand_id || "N/A"}
                </p>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                  Created
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {formatDate(created_at)}
                </p>
              </div>
            </div>

            {video_metadata && Object.keys(video_metadata).length > 0 && (
              <div>
                <h4 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                  Metadata
                </h4>
                <div className="rounded-md bg-muted p-2 sm:p-3 overflow-x-auto">
                  {Object.entries(video_metadata).map(([key, value]) => (
                    <div
                      key={key}
                      className="grid grid-cols-[1fr_2fr] gap-2 text-xs sm:text-sm mb-1"
                    >
                      <span className="font-medium truncate">{key}:</span>
                      <span className="truncate" title={String(value)}>
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {transcript && (
              <div>
                <h4 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                  Transcript
                </h4>
                <div className="rounded-md bg-muted p-2 sm:p-3 max-h-[120px] sm:max-h-[150px] overflow-y-auto">
                  <p className="text-xs sm:text-sm whitespace-pre-wrap">
                    {transcript}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-4 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="mr-2 text-xs sm:text-sm h-8 sm:h-10"
              onClick={() => setShowDetails(false)}
            >
              Close
            </Button>
            <Button
              size="sm"
              className="bg-[#3A8165] hover:bg-[#3e6359] text-white text-xs sm:text-sm h-8 sm:h-10"
              onClick={() => {
                onSelect?.(!isSelected);
                setShowDetails(false);
              }}
            >
              {isSelected ? "Deselect" : "Select"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
