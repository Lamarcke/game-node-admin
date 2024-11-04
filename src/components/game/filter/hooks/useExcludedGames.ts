import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExtendedUseQueryResult } from "@/util/types/ExtendedUseQueryResult";
import {
    FindAllExcludedGamesResponseDto,
    GameExclusion,
    GameFilterService,
} from "@/wrapper/server";

export function useExcludedGames(
    offset = 0,
    limit = 20,
): ExtendedUseQueryResult<FindAllExcludedGamesResponseDto> {
    const queryClient = useQueryClient();

    const queryKey = ["game", "excluded", "all", offset, limit];

    const invalidate = () => {
        queryClient.invalidateQueries({
            queryKey: queryKey.slice(0, 4),
        });
    };

    return {
        ...useQuery({
            queryKey,
            queryFn: async () => {
                return GameFilterService.gameFilterControllerFindAll(
                    offset,
                    limit,
                );
            },
            retry: 2,
        }),
        queryKey,
        invalidate,
    };
}
