"use client";

import React, { useMemo, useState } from "react";
import { useExcludedGames } from "@/components/game/filter/hooks/useExcludedGames";
import {
    MantineReactTable,
    MRT_ColumnDef,
    MRT_PaginationState,
} from "mantine-react-table";
import { useCustomTable } from "@/components/table/hooks/use-custom-table";
import { Game, GameExclusion } from "@/wrapper/server";
import {
    ActionIcon,
    Badge,
    Box,
    Button,
    Group,
    MantineColor,
    Modal,
    Paper,
    Tooltip,
} from "@mantine/core";
import { UserAvatarGroup } from "@/components/general/avatar/UserAvatarGroup";
import { useGames } from "@/components/game/hooks/useGames";
import GameFigureImage from "@/components/game/figure/GameFigureImage";
import {
    IconAdjustmentsPlus,
    IconCirclePlus,
    IconPlus,
    IconSquarePlus,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import AddGameExclusionForm from "@/components/game/filter/form/AddGameExclusionForm";

interface GameExclusionWithGameInfo extends GameExclusion {
    game: Game;
}

const columns: MRT_ColumnDef<GameExclusionWithGameInfo>[] = [
    {
        header: "Image",
        id: "figure",
        maxSize: 100,
        Cell: ({ row }) => {
            return (
                <Box className={"max-w-20"}>
                    <GameFigureImage game={row.original.game} />
                </Box>
            );
        },
    },
    {
        header: "Game Id",
        accessorKey: "targetGameId",
        enableSorting: false,
    },
    {
        header: "Name",
        accessorKey: "game.name",
    },
    {
        accessorFn: (row) => {
            return row.isActive ? "Active" : "Inactive";
        },
        header: "Status",
        filterVariant: "select",
        mantineFilterSelectProps: {
            data: [
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" },
            ],
        },
        Cell: ({ row, renderedCellValue }) => {
            const item = row.original;
            const color: MantineColor = item.isActive ? "green" : "red";
            return <Badge color={color}>{renderedCellValue}</Badge>;
        },
    },
    {
        header: "Issued by",
        accessorKey: "issuerUserId",
        Cell: ({ row }) => {
            return <UserAvatarGroup userId={row.original.issuerUserId} />;
        },
    },
    {
        header: "Created At",
        accessorFn: (row) => new Date(row.createdAt).toLocaleString("en-US"),
        sortingFn: (rowA, rowB, columnId) => {
            const createDateA = new Date(rowA.original.createdAt);
            const createDateB = new Date(rowB.original.createdAt);

            return createDateA.getTime() - createDateB.getTime();
        },
        id: "createdAt",
    },
];

const ExcludedGamesTable = () => {
    const [pagination, setPagination] = useState<MRT_PaginationState>({
        pageIndex: 0,
        pageSize: 20,
    });

    const [addExclusionModalOpened, addExclusionModalUtils] = useDisclosure();

    const offset = pagination.pageIndex * pagination.pageSize;
    const limit = pagination.pageSize;

    const { data, isLoading, isError, isFetching } = useExcludedGames(
        offset,
        limit,
    );

    const gameIds = useMemo(() => {
        return data?.data.map((exclusion) => exclusion.targetGameId);
    }, [data]);

    const gamesQuery = useGames({
        gameIds,
        relations: {
            cover: true,
        },
    });

    const items = useMemo(() => {
        if (data && gamesQuery.data) {
            return data.data.map((exclusion): GameExclusionWithGameInfo => {
                const relatedGame = gamesQuery.data.find(
                    (game) => game.id === exclusion.targetGameId,
                )!;

                return {
                    ...exclusion,
                    game: relatedGame,
                };
            });
        }
    }, [data, gamesQuery.data]);

    const table = useCustomTable<GameExclusionWithGameInfo>({
        columns: columns,
        data: items ?? [],
        state: {
            isLoading: isLoading,
            showAlertBanner: isError,
            showProgressBars: isFetching,
            pagination,
        },
        manualPagination: true,
        onPaginationChange: setPagination,
        rowCount: data?.pagination.totalItems ?? 0,
        renderTopToolbarCustomActions: (table) => {
            return (
                <Group className={"w-full h-full items-center justify-end"}>
                    <Tooltip label={"Add exclusion"}>
                        <ActionIcon
                            variant={"subtle"}
                            color={"gray"}
                            size={"lg"}
                            onClick={addExclusionModalUtils.open}
                        >
                            <IconSquarePlus />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            );
        },
    });

    return (
        <Paper withBorder radius="md" p="md" mt="lg">
            <Modal
                opened={addExclusionModalOpened}
                onClose={addExclusionModalUtils.close}
                title={"Add game exclusion"}
                size={"lg"}
            >
                <AddGameExclusionForm onClose={addExclusionModalUtils.close} />
            </Modal>
            <MantineReactTable table={table} />
        </Paper>
    );
};

export default ExcludedGamesTable;
