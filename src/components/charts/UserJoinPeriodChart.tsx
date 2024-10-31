import React, { useMemo } from "react";
import { useUserProfiles } from "@/components/profile/hooks/useUserProfiles";
import CenteredLoading from "@/components/general/CenteredLoading";
import { LineChart, LineChartProps } from "@mantine/charts";
import { Profile } from "@/wrapper/server";

interface JoinPeriodItem {
  createdAt: string;
  count: number;
}

const profileToPeriodItems = (profiles: Profile[]): JoinPeriodItem[] => {
  const periodMap = new Map<string, number>();

  for (const profile of profiles) {
    const createdAtDate = new Date(profile.createdAt);
    const createdAtMonth = `${createdAtDate.getMonth() + 1}`.padStart(2, "0");
    const periodString = `${createdAtMonth}/${createdAtDate.getFullYear()}`;
    const periodValue = periodMap.get(periodString);

    if (periodValue == undefined) {
      periodMap.set(periodString, 1);
      continue;
    }

    periodMap.set(periodString, periodValue + 1);
  }

  return Array.from(periodMap.entries()).map(([k, v]): JoinPeriodItem => {
    return {
      createdAt: k,
      count: v,
    };
  });
};

interface Props extends Omit<LineChartProps, "data" | "series" | "dataKey"> {}

const UserJoinPeriodChart = ({ ...others }: Props) => {
  const { isLoading, data } = useUserProfiles();

  const chartData = useMemo<JoinPeriodItem[] | undefined>(() => {
    if (data) {
      return profileToPeriodItems(data);
    }
    return undefined;
  }, [data]);

  if (isLoading) {
    return <CenteredLoading message={"Loading..."} />;
  } else if (chartData == undefined) {
    return null;
  }

  return (
    <LineChart
      h={250}
      w={"100%"}
      {...others}
      data={chartData}
      dataKey="createdAt"
      series={[{ name: "count", label: "Users", color: "indigo.6" }]}
      curveType="linear"
    />
  );
};

export default UserJoinPeriodChart;
