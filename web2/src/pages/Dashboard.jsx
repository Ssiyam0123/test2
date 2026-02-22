import { lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardStatsCards from "../components/dashboard/DashboardStatsCards";
import { fetchDashboardStats } from "../api/dashboard.api.js";
import { RefreshCw, AlertCircle } from "lucide-react";

// Lazy-loaded heavy components
const StatusDistributionChart = lazy(() => import("../components/dashboard/StatusDistributionChart"));
const BatchDistributionChart = lazy(() => import("../components/dashboard/BatchDistributionChart"));
const GenderChart = lazy(() => import("../components/dashboard/GenderChart")); // 
const MonthlyEnrollmentChart = lazy(() => import("../components/dashboard/MonthlyEnrollmentChart"));
const CourseDistributionTable = lazy(() => import("../components/dashboard/CourseDistributionTable"));
const RecentActivities = lazy(() => import("../components/dashboard/RecentActivities"));


// --- SKELETON LOADERS ---
// Reusable pulse animation block for charts
const ChartSkeleton = ({ height = "300px" }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full animate-pulse" style={{ height }}>
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
    <div className="h-[calc(100%-2rem)] bg-gray-100 rounded-lg w-full"></div>
  </div>
);

// Specific skeleton for the top row of 4 stat cards
const StatsSkeletonRow = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="space-y-3 w-full">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="h-10 w-10 bg-gray-100 rounded-full flex-shrink-0"></div>
        </div>
      </div>
    ))}
  </div>
);

// --- MAIN COMPONENT ---
const Dashboard = () => {
  const {
    data: dashboardData,
    isLoading,
    isRefetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000, 
    cacheTime: 10 * 60 * 1000, 
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const stats = dashboardData?.data || null;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      
      {/* 1. INSTANT HEADER (Never hidden) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time analytics for the Student Management System
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-100 transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefetching ? "animate-spin text-blue-600" : ""} />
          <span>{isRefetching ? "Refreshing..." : "Refresh Data"}</span>
        </button>
      </div>

      {/* GLOBAL ERROR STATE - Keeps header visible */}
      {isError ? (
        <div className="bg-red-50 border border-red-100 rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-900 mb-2">Failed to load analytics</h2>
          <p className="text-red-600 max-w-md">{error?.message || "Our servers couldn't generate the dashboard. Please try again."}</p>
          <button onClick={() => refetch()} className="mt-6 px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors">
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* 2. STATS ROW (Shows skeleton if loading) */}
          {isLoading ? (
            <StatsSkeletonRow />
          ) : (
            <DashboardStatsCards stats={stats} />
          )}

          {/* 3. MIDDLE CHARTS SECTION (Individual Suspense boundaries) */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {isLoading ? <ChartSkeleton height="320px" /> : (
              <Suspense fallback={<ChartSkeleton height="320px" />}>
                <StatusDistributionChart statusDistribution={stats?.statusDistribution} height={320} />
              </Suspense>
            )}

            {isLoading ? <ChartSkeleton height="320px" /> : (
              <Suspense fallback={<ChartSkeleton height="320px" />}>
                <BatchDistributionChart batchDistribution={stats?.batchDistribution} height={320} />
              </Suspense>
            )}
          </div>

          {/* 4. BOTTOM CHARTS SECTION */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {isLoading ? <ChartSkeleton height="320px" /> : (
              <Suspense fallback={<ChartSkeleton height="320px" />}>
                {/* Updated to pass Gender data instead of Competency */}
                <GenderChart genderDistribution={stats?.genderDistribution} height={320} />
              </Suspense>
            )}

            {isLoading ? <ChartSkeleton height="320px" /> : (
              <Suspense fallback={<ChartSkeleton height="320px" />}>
                <MonthlyEnrollmentChart monthlyData={stats?.monthlyData} height={320} />
              </Suspense>
            )}
          </div>

          {/* 5. TABLES SECTION */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {isLoading ? <ChartSkeleton height="450px" /> : (
              <Suspense fallback={<ChartSkeleton height="450px" />}>
                <CourseDistributionTable courseDistribution={stats?.courseDistribution} totalStudents={stats?.totals?.students?.total} />
              </Suspense>
            )}

            {isLoading ? <ChartSkeleton height="450px" /> : (
              <Suspense fallback={<ChartSkeleton height="450px" />}>
                <RecentActivities recentActivities={stats?.recentActivities} onRefresh={refetch} />
              </Suspense>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;