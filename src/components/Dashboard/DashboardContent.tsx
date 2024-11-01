"use client";

import { Flex, Grid, GridCol } from "@mantine/core";
import { BalanceCard } from "./BalanceCard";
import { OverviewCard } from "./OverviewCard";
import { ProfileCard } from "./ProfileCard";
import { TransactionCard } from "./TransactionCard";
import { WelcomeCard } from "./WelcomeCard";
import { StatsGroup } from "../StatsGroup";
import { mockData } from "../StatsGroup/mock";
import ActiveUsersSection from "@/components/profile/ActiveUsersSection";
import UserJoinPeriodChart from "@/components/charts/UserJoinPeriodChart";
import UserJoinSection from "@/components/profile/UserJoinSection";
import ActivityByPeriodSection from "@/components/activity/ActivityByPeriodSection";

export function DashboardContent() {
  return (
    <Grid>
      <GridCol span={{ sm: 12, md: 12, lg: 4 }}>
        <ActiveUsersSection />
      </GridCol>
      <GridCol span={{ sm: 12, md: 12, lg: 8 }}>
        <Flex direction="column" h="100%" justify="space-between" gap="md">
          <UserJoinSection />
        </Flex>
      </GridCol>
      <GridCol span={{ sm: 12, md: 12, lg: 12 }}>
        <ActivityByPeriodSection />
      </GridCol>
    </Grid>
  );
}
