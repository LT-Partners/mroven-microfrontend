"use client";

import React, { useState, useEffect } from "react";
import {
  ChefHat,
  Search,
  Lightbulb,
  PenTool,
  Link,
  ArrowRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import apiClient from "../../../packages/utils/src/apiClient";
import { useMrOven } from "../context/MrOvenContext";

const MrOvenDashboard = () => {
  const {
    setStep,
    goToNextStep,
    allBrands,
    activeTab,
    setActiveTab,
    updateURLParams,
  } = useMrOven();
  const userLocal = JSON.parse(localStorage.getItem("user") || "{}");
  const [users, setUsers] = useState([]); // Store all users

  const [reports, setReports] = useState([]); // Store current page reports
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [expandedReports, setExpandedReports] = useState({});

  const reportsPerPage = 10;

  // Fetch reports based on current page and active tab
  const fetchReports = async (page, tab) => {
    setLoading(true);
    try {
      const skip = (page - 1) * reportsPerPage;
      const limit = reportsPerPage;

      // Add user_id filter if on "myRuns" tab
      const userFilter = tab === "myRuns" ? `&user_id=${userLocal.id}` : "";

      // // Fetch more records to account for filtering
      // const fetchLimit = limit * 3; // Fetch 3x the limit to ensure we have enough after filtering

      const response: any = await apiClient.get(
        `/mr-oven/api/analysis/?skip=${skip}&limit=${limit}${userFilter}`
      );

      const reports: any = response.data.items.filter(
        (data) => data.creating_insights.length
      );
      const data: any = response.data;

      if (reports && Array.isArray(reports)) {
        // // Filter reports with creating_insights
        // const filteredReports = data.items.filter(
        //   (d) => d.creating_insights && d.creating_insights.length
        // );

        // Take only the first 'limit' items after filtering
        const paginatedReports = reports.slice(0, limit);
        setReports(paginatedReports);

        // Calculate total pages based on total count from API and our filter ratio
        if (data.total !== undefined) {
          // Estimate the total filtered items based on the ratio of filtered/total in this batch
          const filterRatio = data.length > 0 ? data.length / data.length : 1;
          const estimatedFilteredTotal = Math.ceil(data.total * filterRatio);
          setTotalItems(estimatedFilteredTotal);
          setTotalPages(Math.ceil(estimatedFilteredTotal / reportsPerPage));
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to fetch reports");
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchReports(1, activeTab);

    // Fetch users
    const fetchUsers = async () => {
      try {
        const response = await apiClient.get(`/user/v1/admin/all`);
        if (response.data.response && Array.isArray(response.data.response)) {
          setUsers(response.data.response);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();
  }, []);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when changing tabs
    fetchReports(1, tab);
  };

  // Handle pagination
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      fetchReports(pageNumber, activeTab);
    }
  };

  // Function to toggle expanded state for a report
  const toggleReportExpansion = (reportId) => {
    setExpandedReports((prev) => ({
      ...prev,
      [reportId]: !prev[reportId],
    }));
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Extract brand name if available
  const getBrandName = (report) => {
    const brand = allBrands.find((brand) => brand.id === report.brand_id);

    // For demonstration, we'll use "Arey Grey" as the default brand name
    return brand?.name || "Unknown Brand";
  };

  const getUserName = (userId) => {
    const user = users.find((user) => user.id === userId);
    return user
      ? user.name || user.email || `User ${userId}`
      : `User ${userId}`;
  };

  // Function to get content angles from a report
  const getContentAngles = (report) => {
    // Check if report has creating_insights with content_angles
    if (report.creating_insights && report.creating_insights.length > 0) {
      const insight = report.creating_insights[0];
      return insight.content_angles || [];
    }
    return [];
  };

  // Check if a report has content angles
  const hasContentAngles = (report) => {
    const angles = getContentAngles(report);
    return angles.length > 0;
  };

  // Handle navigation to Creative Insights
  const navigateToCreativeInsights = (analysisId) => {
    // Push to browser history before changing the step
    window.history.pushState(
      { step: 1, metadata: { analysis_id: analysisId } },
      "",
      window.location.href
    );

    setStep({
      step: 1,
      metadata: {
        analysis_id: analysisId,
      },
      loading: false,
    });

    // Update URL with parameters
    updateURLParams("insights", analysisId);
  };

  // Handle navigation to New Concepts
  const navigateToNewConcepts = (analysisId) => {
    // Push to browser history before changing the step
    window.history.pushState(
      { step: 2, metadata: { analysis_id: analysisId, previousStep: -1 } },
      "",
      window.location.href
    );

    setStep({
      step: 2,
      metadata: {
        analysis_id: analysisId,
        previousStep: -1,
      },
      loading: false,
    });

    // Update URL with parameters
    updateURLParams("concepts", analysisId);
  };

  return (
    <div className="overflow-auto p-6 font-sans text-gray-800 bg-gray-50 my-7 ml-7">
      {/* Header with Logo */}
      <div className="flex flex-col mb-2 gap-2">
        <div className="flex gap-4  mr-4">
          <img
            height={80}
            width={80}
            src={`/prizm/mr-oven.png`}
            alt="Mr. Oven Logo"
          />

          <h1
            className="text-6xl font-extrabold text-[#3D3D3D]"
            style={{
              fontFamily: "Outfit",
            }}
          >
            Mr. Oven
          </h1>
        </div>
        <p
          className="text-2xl mt-1 text-gray-600"
          style={{
            fontFamily: "Outfit",
          }}
        >
          Your AI-powered creative sous chef
        </p>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-3 gap-6 my-12">
        <div className="flex flex-col gap-4 cursor-pointer hover:opacity-90 transition-opacity">
          <div className="flex flex-col gap-2">
            <div className="flex items-center mb-3">
              <Search className="mr-2 text-gray-700" size={24} />
              <h3
                className="text-xl font-semibold"
                style={{
                  fontFamily: "Outfit",
                }}
              >
                Creative Insights
              </h3>
            </div>
            <span className="text-gray-600 text-xl">
              The ingredients behind your top-performing ads.
            </span>
          </div>

          <p
            className="text-gray-500"
            style={{
              fontFamily: "Outfit",
            }}
          >
            Mr. Oven breaks down your client's best videos to show you exactly
            what's driving performance — your creative formula, served on a
            silver platter.
          </p>
        </div>

        <div className="flex flex-col gap-4 cursor-pointer hover:opacity-90 transition-opacity">
          <div className="flex flex-col gap-2">
            <div className="flex  items-center mb-3">
              <Lightbulb className="mr-2 text-gray-700" size={24} />

              <h3
                className="text-xl font-semibold"
                style={{
                  fontFamily: "Outfit",
                }}
              >
                New Concepts
              </h3>
            </div>
            <span className="text-gray-600 text-xl">
              Test-ready concepts, fresh out of the oven.
            </span>
          </div>
          <p
            className="text-gray-500"
            style={{
              fontFamily: "Outfit",
            }}
          >
            From scroll-stopping visuals to full ad outlines, Mr. Oven helps you
            generate new ideas that are ready to test, tweak, and bake into your
            next winning campaign.
          </p>
        </div>

        <div className="flex flex-col gap-4 cursor-pointer hover:opacity-90 transition-opacity">
          <div className="flex flex-col gap-2">
            <div className="flex items-center mb-3">
              <PenTool className="mr-2 text-gray-700" size={24} />
              <h3
                className="text-xl font-semibold"
                style={{
                  fontFamily: "Outfit",
                }}
              >
                Copywriting
              </h3>
            </div>
            <span className="text-gray-600 text-xl">
              AI-powered copy to give you a head start.
            </span>
          </div>
          <p
            className="text-gray-500"
            style={{
              fontFamily: "Outfit",
            }}
          >
            Mr. Oven serves up headlines, hooks, and CTAs built on real
            insights, giving you a running start on your next concept. Tweak it,
            remix it, or use it as is!
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="flex justify-center my-6">
        <button
          style={{
            fontFamily: "Outfit",
          }}
          className="flex items-center bg-[#3A8165] hover:bg-[#3e6359] text-white font-light py-2 px-8 rounded-full transition-colors"
          onClick={() => goToNextStep()}
        >
          <ChefHat className="mr-2" size={20} />
          GET COOKIN'
        </button>
      </div>

      {/* Separator Line */}
      <div className="border-t border-gray-300 my-8"></div>

      {/* Browse Reports Section */}
      <div className="mt-6  min-h-48">
        <h2
          className="text-xl font-semibold mb-4"
          style={{
            fontFamily: "Outfit",
          }}
        >
          Browse Reports
        </h2>

        {/* Tabs */}
        <div className="flex mb-6">
          <div className="bg-gray-300 rounded-full p-1 inline-flex">
            <button
              onClick={() => handleTabChange("myRuns")}
              className={`px-4 py-1 rounded-full text-sm ${activeTab === "myRuns" ? "bg-white text-gray-800" : "text-gray-600"}`}
              style={{
                fontFamily: "Outfit",
              }}
            >
              My Runs
            </button>
            <button
              onClick={() => handleTabChange("allRuns")}
              className={`px-4 py-1 rounded-full text-sm ${activeTab === "allRuns" ? "bg-white text-gray-800" : "text-gray-600"}`}
              style={{
                fontFamily: "Outfit",
              }}
            >
              All Runs
            </button>
          </div>
        </div>

        {/* Column Headers */}
        <div className="flex items-center py-3 border-b border-gray-300 font-medium text-gray-700">
          <div className="w-1/6" style={{ fontFamily: "Outfit" }}>
            Brand
          </div>
          <div className="w-1/6" style={{ fontFamily: "Outfit" }}>
            Date Created
          </div>
          <div className="w-1/6" style={{ fontFamily: "Outfit" }}>
            Last Chef
          </div>
          <div className="flex-1" style={{ fontFamily: "Outfit" }}>
            Reports
          </div>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="text-center py-6">Loading reports...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-6">{error}</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-6 text-gray-600">No reports found</div>
        ) : (
          <>
            {/* <div className="text-xs text-gray-500 mb-2">
              Showing {reports.length} reports
            </div> */}
            <div className="max-h-[calc(100vh-620px)] overflow-y-auto">
              <div className="space-y-px overflow-y-auto">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="border-b border-gray-200 py-6"
                  >
                    <div className="flex items-center">
                      <div className="w-1/6">
                        <span
                          className="font-medium text-gray-700"
                          style={{
                            fontFamily: "Outfit",
                          }}
                        >
                          {getBrandName(report)}
                        </span>
                      </div>

                      <div className="w-1/6">
                        <span
                          className="text-sm text-gray-700"
                          style={{
                            fontFamily: "Outfit",
                          }}
                        >
                          {formatDate(report.created_at)}
                        </span>
                      </div>

                      <div className="w-1/6">
                        <span
                          className="text-sm text-gray-700"
                          style={{
                            fontFamily: "Outfit",
                          }}
                        >
                          {getUserName(report.user_id)}
                        </span>
                      </div>

                      <div className="flex-1 flex items-center">
                        <div
                          className="flex items-center bg-gray-200 rounded-full px-3 py-1 cursor-pointer hover:bg-gray-300 transition-colors"
                          onClick={() => navigateToCreativeInsights(report.id)}
                        >
                          <Link size={16} className="mr-2 text-gray-500" />
                          <span
                            className="text-sm text-gray-700"
                            style={{
                              fontFamily: "Outfit",
                            }}
                          >
                            Creative Insights Report
                          </span>
                        </div>

                        {hasContentAngles(report) && (
                          <>
                            <ArrowRight
                              size={20}
                              className="mx-4 text-gray-400"
                            />

                            <div
                              className="flex items-center bg-gray-200 rounded-full px-3 py-1 cursor-pointer hover:bg-gray-300 transition-colors"
                              onClick={() => navigateToNewConcepts(report.id)}
                            >
                              <Link size={16} className="mr-2 text-gray-500" />
                              <span
                                className="text-sm text-gray-700"
                                style={{
                                  fontFamily: "Outfit",
                                }}
                              >
                                New Content Angles Report
                              </span>
                            </div>

                            <button
                              onClick={() => toggleReportExpansion(report.id)}
                              className="text-gray-500 ml-3 hover:text-green-700"
                            >
                              {expandedReports[report.id] ? (
                                <ChevronUp size={20} />
                              ) : (
                                <ChevronDown size={20} />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Expanded Content Angles */}
                    {expandedReports[report.id] && hasContentAngles(report) && (
                      <div className="mt-4 pl-[50%] pr-4">
                        <div className="bg-white rounded-md shadow-sm divide-y divide-gray-100">
                          {getContentAngles(report).map((angle, index) => (
                            <div key={index} className="p-4">
                              <h4
                                className="font-medium text-gray-800"
                                style={{ fontFamily: "Outfit" }}
                              >
                                {angle.angle?.title || "Untitled Concept"}
                              </h4>
                              <div
                                className="text-xs text-gray-500 mt-1 mb-2"
                                style={{ fontFamily: "Outfit" }}
                              >
                                Product: {angle.angle?.product || "N/A"}
                              </div>
                              <p
                                className="text-sm text-gray-600 mt-1"
                                style={{ fontFamily: "Outfit" }}
                              >
                                {(angle.angle?.description || "").substring(
                                  0,
                                  150
                                )}
                                ...
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {angle.angle?.creativeFormula?.tags?.map(
                                  (tag, tagIndex) => (
                                    <span
                                      key={tagIndex}
                                      className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                                      style={{ fontFamily: "Outfit" }}
                                    >
                                      {tag}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Pagination - Only show if there are reports to paginate */}
        {reports.length > 0 && totalPages > 1 && (
          <div className="bottom-0 bg-gray-50 pt-4 pb-4 border-t border-gray-200">
            <div className="flex justify-center items-center mt-6">
              <button
                className="p-2 rounded-md hover:bg-gray-200"
                onClick={() => paginate(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft size={16} />
              </button>

              <button
                className="p-2 rounded-md hover:bg-gray-200 mr-1"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>

              {/* Dynamic page number generation */}
              {(() => {
                // Create an array to hold our page buttons
                const pageButtons = [];

                // Determine start and end page numbers to show
                let startPage = Math.max(1, currentPage - 2);
                const endPage = Math.min(totalPages, startPage + 4);

                // Adjust startPage if we're near the end
                if (endPage - startPage < 4) {
                  startPage = Math.max(1, endPage - 4);
                }

                // Add first page if not included in range
                if (startPage > 1) {
                  pageButtons.push(
                    <button
                      key={1}
                      className={`w-8 h-8 mx-1 rounded-md hover:bg-gray-100`}
                      onClick={() => paginate(1)}
                    >
                      1
                    </button>
                  );

                  // Add ellipsis if there's a gap
                  if (startPage > 2) {
                    pageButtons.push(
                      <span key="ellipsis1" className="w-8 text-center mx-1">
                        ...
                      </span>
                    );
                  }
                }

                // Add page numbers
                for (let i = startPage; i <= endPage; i++) {
                  pageButtons.push(
                    <button
                      key={i}
                      className={`w-8 h-8 mx-1 rounded-md ${currentPage === i ? "bg-gray-200 font-medium" : "hover:bg-gray-100"}`}
                      onClick={() => paginate(i)}
                    >
                      {i}
                    </button>
                  );
                }

                // Add last page if not included in range
                if (endPage < totalPages) {
                  // Add ellipsis if there's a gap
                  if (endPage < totalPages - 1) {
                    pageButtons.push(
                      <span key="ellipsis2" className="w-8 text-center mx-1">
                        ...
                      </span>
                    );
                  }

                  pageButtons.push(
                    <button
                      key={totalPages}
                      className={`w-8 h-8 mx-1 rounded-md hover:bg-gray-100`}
                      onClick={() => paginate(totalPages)}
                    >
                      {totalPages}
                    </button>
                  );
                }

                return pageButtons;
              })()}

              <button
                className="p-2 rounded-md hover:bg-gray-200 ml-1"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>

              <button
                className="p-2 rounded-md hover:bg-gray-200"
                onClick={() => paginate(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MrOvenDashboard;
