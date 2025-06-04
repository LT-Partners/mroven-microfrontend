import apiClient from "../../../packages/utils/src/apiClient";

interface VideoMetadata {
  name: string;
  // Add other metadata properties as needed
}

export const uploadVideos = async (
  files: File[],
  metadataList: VideoMetadata[] = [],
  skipFailed: boolean = false
) => {
  const brandObjectSelected = JSON.parse(
    localStorage.getItem("brandObjectSelected") || "{}"
  );

  if (!brandObjectSelected?.id) {
    throw new Error("Brand ID is required");
  }

  // Create a FormData object for the multipart request
  const formData = new FormData();

  // Add brand_id
  formData.append("brand_id", brandObjectSelected.id.toString());

  // Add metadata_list as a JSON string (one metadata object per video)
  const completeMetadataList = files.map((file, index) => {
    return metadataList[index] || { name: file.name };
  });
  formData.append("metadata_list", JSON.stringify(completeMetadataList));

  // Add all video files
  files.forEach((file) => {
    formData.append("videos", file);
  });

  // Add skip_failed parameter if provided
  if (skipFailed) {
    formData.append("skip_failed", "true");
  }

  try {
    const response = await apiClient.post(
      "/mr-oven/api/videos/upload-multiple-videos",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to upload videos: ${error.message}`);
  }
};


interface VideoMetadata {
  name: string;
  // Add other metadata properties as needed
}

export const uploadSingleVideo = async (
  file: File,
  metadata: VideoMetadata
) => {
  const brandObjectSelected = JSON.parse(
    localStorage.getItem("brandObjectSelected") || "{}"
  );

  if (!brandObjectSelected?.id) {
    throw new Error("Brand ID is required");
  }

  // Create a FormData object for the multipart request
  const formData = new FormData();

  // Add video file
  formData.append("video", file);

  // Add metadata as a JSON string
  formData.append("metadata", JSON.stringify(metadata));

  try {
    const response = await apiClient.post(
      `/mr-oven/api/videos/upload-video?brand_id=${brandObjectSelected.id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to upload video: ${error.message}`);
  }
};