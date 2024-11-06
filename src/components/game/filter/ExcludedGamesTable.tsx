"use client";

import React, { useMemo, useState } from "react";
import { useExcludedGames } from "@/components/game/filter/hooks/useExcludedGames";
import {
    MantineReactTable,
    MRT_ColumnDef,
    MRT_PaginationState,
} from "mantine-react-table";
import { useCustomTable } from "@/components/table/hooks/use-custom-table";
import {
    ChangeExclusionStatusDto,
    Game,
    GameExclusion,
    GameFilterService,
} from "@/wrapper/server";
import {
    ActionIcon,
    Badge,
    Box,
    Button,
    Group,
    MantineColor,
    Menu,
    Modal,
    Paper,
    Tooltip,
    Text,
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
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { getErrorMessage } from "@/util/getErrorMessage";
import { modals } from "@mantine/modals";

// necessary because useMutation only allows for one parameter in mutationFn
interface ChangeExclusionMutationRequest extends ChangeExclusionStatusDto {
    gameId: number;
}

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

    const { data, isLoading, isError, isFetching, invalidate } =
        useExcludedGames(offset, limit);

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

    const changeStatusMutation = useMutation({
        mutationFn: async (dto: ChangeExclusionMutationRequest) => {
            await GameFilterService.gameFilterControllerChangeStatus(
                dto.gameId,
                {
                    isActive: dto.isActive,
                },
            );

            return dto.isActive;
        },
        onSuccess: (isActive) => {
            notifications.show({
                color: "green",
                message: `Sucessfully ${isActive ? "activated" : "deactivated"} filter.`,
            });
        },
        onError: (err) => {
            const msg = getErrorMessage(err);

            notifications.show({
                color: "red",
                message: msg,
            });
        },
        onSettled: () => {
            invalidate();
        },
    });

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
        enableRowActions: true,
        renderRowActionMenuItems: (tableItem) => {
            const item = tableItem.row.original;
            return (
                <>
                    <Menu.Item
                        onClick={() => {
                            const dto: ChangeExclusionMutationRequest = {
                                gameId: item.targetGameId,
                                isActive: !item.isActive,
                            };
                            changeStatusMutation.mutate(dto);
                        }}
                    >
                        {item.isActive ? "Deactivate" : "Activate"}
                    </Menu.Item>
                </>
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
