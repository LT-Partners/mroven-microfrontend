import React from "react";

const SubTitle = () => {
  return (
    <div className="text-xl text-gray-800 font-normal"
      style={{
        fontFamily: "Outfit",
      }}
    >
      First, pick the videos you want analyzed (up to 10)—Mr. Oven will use your
      video(s) to uncover performant patterns and creative insights!{" "}
      <span className="text-gray-500">
        (Note: videos are pulled from the client's "Top Performers" folder in
        Air.)
      </span>
    </div>
  );
};

export default SubTitle;
