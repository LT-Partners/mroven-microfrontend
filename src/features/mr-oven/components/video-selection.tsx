import React, { useEffect, useState, useRef } from "react";
import VideoCard from "./video-card";
import { useMrOven } from "../context/MrOvenContext";
import Title from "./title";
import SubTitle from "./subtitle";
import { Button, CircularProgress } from "@mui/material";
import { Toastify } from "../../../packages/ui/src/toast";
import { FileUploadDialog } from "./dialogs/file-upload-dialog";
import { Upload } from "lucide-react";
import apiClient from "../../../packages/utils/src/apiClient";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ModelDropdown from "./model-dropdown";
import TagList from "./brand-tag";
import ClientDropdown, { Client } from "./brand-selection";
const VideoSelection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const userLocal = JSON.parse(localStorage.getItem("user") || "{}");
  const {
    selectedVideos,
    setSelectedVideos,
    setStep,
    goToPrevStep,
    setIsLoading,
    selectedModel,
    popFromStepStack,
  } = useMrOven();

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [initiatingAnalysis, setInitiatingAnalysis] = useState(false);
  const [brands, setBrands] = useState<any[]>([]);
  const [brandColorIndices, setBrandColorIndices] = useState<{
    [key: number]: number;
  }>({});
  const allBrands = JSON.parse(localStorage.getItem("user") || "{}")
    ?.permissions?.brands;

  useEffect(() => {
    if (brands) {
      setBrands(
        allBrands?.map((brand: any) => ({
          id: brand.id,
          name: brand.name,
          selected: brand.id === brandObjectSelected.id ? true : false,
          logoUrl: brand.image_url,
        }))
      );
    }
  }, []);

  // Update color indices whenever selected brands change
  useEffect(() => {
    const selectedBrands = brands?.filter((brand) => brand.selected);
    const newColorIndices: { [key: number]: number } = {};
    selectedBrands?.forEach((brand, index) => {
      newColorIndices[brand.id] = index;
    });
    setBrandColorIndices(newColorIndices);
  }, [brands]);

  const limit = 10;

  // Add a ref to track the video container
  const videoContainerRef = useRef(null);

  const brandObjectSelected = JSON.parse(
    localStorage.getItem("brandObjectSelected")
  );
  const { brandName } = useParams();

  const fetchVideos = async (skip = 0) => {
    try {
      console.log("fetch video call");
      if (brands.length === 0) return;
      setLoading(true);
      const response = await apiClient.get(
        `/mr-oven/api/videos/brands?skip=${skip}&limit=${limit}&sort_by=created_at&order=desc${brands
          .filter((brand) => brand.selected)
          .map((brand) => `&brand_ids=${brand.id}`)
          .join("")}`,
        {
          headers: {
            accept: "application/json",
          },
        }
      );

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = response.data;
      console.log(response, "response");

      if (skip === 0) {
        setVideos(data.items);
      } else {
        setVideos((prev) => [...prev, ...data.items]);
      }

      setHasMore(data.items.length === limit);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching videos:", error);
      Toastify("error", "Failed to load videos");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset selected videos when navigating back
    setSelectedVideos([]);
    fetchVideos();
  }, [brands]); // Call fetchVideos when brandObjectSelected.id changes

  const loadMore = () => {
    if (loading || !hasMore) return; // Add hasMore check here
    const newSkip = page + 1;
    setPage(newSkip);
    // fetchVideos(newSkip * limit);
  };

  // Update the useEffect dependencies to include loadMore function
  useEffect(() => {
    const handleScroll = () => {
      if (!videoContainerRef.current || loading || !hasMore) return;

      const container = videoContainerRef.current;
      const { scrollTop, scrollHeight, clientHeight } = container;

      // Calculate when user has scrolled to bottom (with a threshold of 100px)
      const scrollThreshold = 100;
      if (scrollHeight - scrollTop - clientHeight < scrollThreshold) {
        loadMore();
      }
    };

    const containerElement = videoContainerRef.current;
    if (containerElement) {
      containerElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (containerElement) {
        containerElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [loading, hasMore, page, loadMore]); // Add loadMore to dependencies

  // Move loadMore function definition before the useEffect

  const handleVideoSelect = (id, selected) => {
    if (selected) {
      setSelectedVideos([...selectedVideos, id]);
    } else {
      setSelectedVideos(selectedVideos.filter((videoId) => videoId !== id));
    }
  };

  useEffect(() => {
    if (selectedVideos.length > 10) {
      Toastify("warning", "You can select up to 10 videos for analysis.");
    }
  }, [selectedVideos]);

  const createCreativeInsightsAnalysis = async () => {
    try {
      setInitiatingAnalysis(true);

      const response = await apiClient.post(
        "/mr-oven/api/creative-insights-sse/analyze",
        {
          video_ids: selectedVideos,
          user_id: userLocal.id,
          brand_id: brandObjectSelected?.id,
          agent_type: selectedModel || undefined,
        }
      );

      const { session_id } = response.data;

      if (!session_id) {
        throw new Error("No analysis run ID received from server");
        setInitiatingAnalysis(false);
        return;
      }

      setStep({
        step: 1,
        metadata: {
          analysis_id: session_id,
          streamProcess: true,
        },
        loading: false,
      });
    } catch (error) {
      console.error("Error creating creative insights analysis:", error);
      Toastify(
        "error",
        error.response?.data?.detail || "Failed to start video analysis"
      );
      setInitiatingAnalysis(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 m-8 overflow-hidden">
      <FileUploadDialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        fetchVideos={fetchVideos}
      />
      <div className="header flex flex-col gap-4">
        <div className="title flex justify-between items-center">
          <Title />
          <div>
            <Button
              className="flex justify-center items-center gap-2"
              sx={{
                backgroundColor: "transparent",
                color: "#3A8165",
                border: "1px solid #3A8165",
                fontSize: "1.2rem",
                fontFamily: "Outfit",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "0.2rem 2rem",
                borderRadius: "10rem",
                minWidth: "4rem",
                fontWeight: 400,
              }}
              onClick={() => setShowUploadDialog(true)}
            >
              <div className="">
                <Upload />
              </div>
              UPLOAD VIDEOS
            </Button>
          </div>
        </div>
        <div className="subtitle w-full">
          <SubTitle />
        </div>
      </div>

      <div
        className="overflow-x-hidden overflow-y-auto h-[60vh]"
        ref={videoContainerRef}
      >
        {/* <div
          className="sticky top-0 left-0 right-0 h-6 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)",
            zIndex: 2,
          }}
        >
          
        </div> */}
        <ClientDropdown brands={brands} setBrands={setBrands} />
        <TagList brands={brands} setBrands={setBrands} />
        {loading && videos.length === 0 ? (
          <div className="flex justify-center items-center p-10">
            Loading videos...
          </div>
        ) : videos.length === 0 ? (
          <div className="flex justify-center items-center p-10">
            No videos found
          </div>
        ) : (
          <div className="grid gap-10 grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {videos.map((video) => (
              <VideoCard
                showBrandName={
                  brands.filter((brand) => brand.selected).length > 1
                }
                brandName={video?.brand_name}
                key={video.id}
                id={video.id}
                url={video.path}
                thumbnail={
                  video?.video_metadata?.thumbnailUrl ||
                  "https://air-prod.imgix.net/2a90245c-e3d5-4529-86a4-c03bb7eec72a/thumbnail.jpg"
                }
                title={video.title}
                description={video.video_metadata?.name || ""}
                isSelected={selectedVideos.includes(video.id)}
                onSelect={(selected) => handleVideoSelect(video.id, selected)}
                transcript={video.transcription || "No transcription available"}
                video_metadata={video.video_metadata || {}}
                created_at={video.created_at}
                brand_id={brandColorIndices[video.brand_id]}
              />
            ))}
          </div>
        )}

        {loading && videos.length > 0 && (
          <div className="flex justify-center mt-8 mb-8">
            <CircularProgress size={30} sx={{ color: "#3A8165" }} />
          </div>
        )}

        <div
          className="sticky bottom-0 left-0 right-0 h-6 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)",
            zIndex: 2,
          }}
        ></div>
      </div>

      <div className="flex justify-between items-center gap-10 text-2xl">
        <div className="flex justify-center items-center gap-4">
          <div
            className="selected-video-display"
            style={{
              fontFamily: "Outfit",
            }}
          >
            {selectedVideos.length} Videos Selected
          </div>
        </div>

        <div className="buttons flex justify-center items-center gap-4">
          <button
            onClick={() => {
              // Pop from stack before setting the step
              popFromStepStack();
              setStep({
                step: -1,
                metadata: {},
                loading: false,
              });
            }}
            style={{
              backgroundColor: "transparent",
              color: "#3A8165",
              border: "1px solid #3A8165",
              fontSize: "1.2rem",
              fontFamily: "Outfit",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "0.2rem 2rem",
              borderRadius: "10rem",
              minWidth: "4rem",
              fontWeight: 400,
            }}
          >
            BACK
          </button>

          <button
            onClick={createCreativeInsightsAnalysis}
            style={{
              backgroundColor:
                selectedVideos.length === 0 || selectedVideos.length > 10
                  ? "#B3B3B3"
                  : "#3A8165",
              color: "white",
              fontSize: "1.2rem",
              fontFamily: "Outfit",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "0.2rem 3rem",
              borderRadius: "10rem",
              minWidth: "4rem",
              fontWeight: 400,
            }}
            disabled={
              selectedVideos.length === 0 ||
              selectedVideos.length > 10 ||
              initiatingAnalysis
            }
          >
            {initiatingAnalysis ? (
              <CircularProgress size={24} color="inherit" className="mr-2" />
            ) : null}
            ANALYZE →
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoSelection;
