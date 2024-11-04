import React from "react";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import ExcludedGamesTable from "@/components/game/filter/ExcludedGamesTable";
import { Box, Text } from "@mantine/core";

const Page = () => {
    return (
        <PageContainer title={"Manage game exclusions"}>
            <Box className={"w-10/12"}>
                <Text className={"text-sm text-dimmed"}>
                    Excluded games won't show up in front-facing content, like
                    the home page, explore screen, or the activities page. They
                    can still be searched for and visited.
                </Text>
            </Box>

            <ExcludedGamesTable />
        </PageContainer>
    );
};

export default Page;
