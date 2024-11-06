import React, { useState } from "react";
import { BaseModalChildrenProps } from "@/util/types/modal-props";
import {
    ActionIcon,
    Box,
    Button,
    ButtonGroup,
    Group,
    Stack,
    Text,
    Title,
    Tooltip,
} from "@mantine/core";
import GameSearchBar from "@/components/game/search-bar/GameSearchBar";
import { useGame } from "@/components/game/hooks/useGame";
import GameFigureImage from "@/components/game/figure/GameFigureImage";
import { IconCancel } from "@tabler/icons-react";
import CenteredLoading from "@/components/general/CenteredLoading";
import { useMutation } from "@tanstack/react-query";
import { getErrorMessage } from "@/util/getErrorMessage";
import { notifications } from "@mantine/notifications";
import { GameFilterService } from "@/wrapper/server";
import { useExcludedGames } from "@/components/game/filter/hooks/useExcludedGames";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";

const AddGameExclusionForm = ({ onClose }: BaseModalChildrenProps) => {
    const [value, setValue] = useState("");
    const [selectedGameId, setSelectedGameId] = useState<number | undefined>(
        undefined,
    );

    const gameQuery = useGame(selectedGameId, {
        relations: {
            cover: true,
        },
    });

    // For query invalidation
    const { invalidate } = useExcludedGames();

    const addExclusionMutation = useMutation({
        mutationFn: async () => {
            if (selectedGameId === undefined) {
                throw new Error("Please select a game.");
            }

            await GameFilterService.gameFilterControllerRegisterExclusion(
                selectedGameId,
            );
        },
        onError: (err) => {
            const msg = getErrorMessage(err);
            notifications.show({
                color: "red",
                message: `Failed to exclude game: ${msg}`,
            });
        },
        onSuccess: () => {
            notifications.show({
                color: "green",
                message: "Successfully added game to exclusion list!",
            });
            invalidate();
            if (onClose) onClose();
        },
    });

    return (
        <Stack className={"w-full items-center h-full min-h-64"}>
            {addExclusionMutation.isError && (
                <CenteredErrorMessage
                    message={getErrorMessage(addExclusionMutation.error)}
                />
            )}
            {gameQuery.isError && (
                <CenteredErrorMessage
                    message={getErrorMessage(gameQuery.error)}
                />
            )}
            {selectedGameId && gameQuery.data ? (
                <Stack className={"w-full items-center"}>
                    <Box className={"w-36"}>
                        <GameFigureImage game={gameQuery.data} />
                    </Box>
                    <Title size={"h4"}>{gameQuery.data.name}</Title>
                    <Text className={"mt-xl"}>
                        Are you sure you want to exclude this game?
                    </Text>
                    <Group gap={8}>
                        <Button
                            onClick={() => {
                                addExclusionMutation.mutate();
                            }}
                            loading={addExclusionMutation.isPending}
                        >
                            Confirm
                        </Button>
                        <Tooltip
                            label={"Cancel action and select another game"}
                        >
                            <ActionIcon
                                size={"lg"}
                                color={"blue"}
                                onClick={() => {
                                    setSelectedGameId(undefined);
                                }}
                            >
                                <IconCancel />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </Stack>
            ) : (
                <Box className={"w-9/12"}>
                    <GameSearchBar
                        label={"Search for a game"}
                        value={value}
                        onChange={(evt) => setValue(evt.currentTarget.value)}
                        onOptionSubmit={(value, options, combobox) => {
                            combobox.closeDropdown();
                            console.log("Selected: " + value);
                            setSelectedGameId(parseInt(value));
                        }}
                        onClear={() => {
                            setValue("");
                        }}
                    />
                </Box>
            )}
            {gameQuery.isLoading && (
                <CenteredLoading message={"Loading game..."} />
            )}
        </Stack>
    );
};

export default AddGameExclusionForm;
