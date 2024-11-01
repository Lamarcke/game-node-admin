"use client";

import React from "react";
import { useReport } from "@/components/report/hooks/useReport";
import { Box, Card, Group, Paper, Stack, Text } from "@mantine/core";
import { UserAvatarGroup } from "@/components/general/avatar/UserAvatarGroup";

interface Props {
    reportId: number;
}

const ReportItemDetails = ({ reportId }: Props) => {
    const { data, isLoading, isError } = useReport(reportId);

    if (!data) return null;

    return (
        <Card>
            <Card.Section></Card.Section>
        </Card>
    );
};

export default ReportItemDetails;
