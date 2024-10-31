import React from "react";
import { useActivities } from "@/components/activity/hooks/useActivities";
import { Activity } from "@/wrapper/server";

interface ActivityPeriodItem {
  // MM/YYYY
  period: string;
  collectionEntryCount: number;
  reviewCount: number;
  followCount: number;
}

const activitiesToChartData = (activities: Activity[]) => {
  const periodMap = new Map<string, number>();

  return activities.map((activity) => {
    const createdAt = new Date(activity.createdAt);
    const createdAtMonth = `${createdAt.getMonth() + 1}`.padStart(2, "0");
    const periodString = `${createdAtMonth}/${createdAt.getFullYear()}`;
    if (periodMap.has(periodString)) {
    }
  });
};

const ActivitiesByPeriodChart = () => {
  const { isLoading, data } = useActivities();

  console.log("data", data);

  return <div></div>;
};

export default ActivitiesByPeriodChart;
