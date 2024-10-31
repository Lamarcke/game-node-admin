import React, { PropsWithChildren, useEffect, useState } from "react";
import { useUserRoles } from "@/components/auth/hooks/useUserRoles";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { EUserRoles } from "@/components/auth/roles";
import { UserRoleClaim } from "supertokens-auth-react/recipe/userroles";
import CenteredLoading from "@/components/general/CenteredLoading";
import { Stack } from "@mantine/core";
import { AccessDeniedScreen } from "supertokens-auth-react/recipe/session/prebuiltui";
import { redirectToAuth } from "supertokens-auth-react";

interface Props extends PropsWithChildren {
  roles: EUserRoles[];
}

const SessionAuthWithRoles = ({ children, roles }: Props) => {
  const [userRoles, loading] = useUserRoles();

  if (loading) {
    return (
      <Stack className={"w-screen h-screen items-center justify-center"}>
        <CenteredLoading message={"Loading access permissions..."} />
      </Stack>
    );
  }

  return (
    <SessionAuth
      requireAuth={true}
      accessDeniedScreen={AccessDeniedScreen}
      overrideGlobalClaimValidators={(globalClaimValidators) => {
        const validators = [...globalClaimValidators];
        if (roles.length > 0) {
          validators.push(UserRoleClaim.validators.includesAny(roles));
        }

        return validators;
      }}
    >
      {children}
    </SessionAuth>
  );
};

export default SessionAuthWithRoles;
