import * as React from "react";

const R = React as Record<string, unknown>;

if (!R.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
  R.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {};
}

const internals = R.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED as Record<string, unknown>;

if (!internals.ReactCurrentOwner) {
  internals.ReactCurrentOwner = { current: null };
}

if (!internals.ReactCurrentBatchConfig) {
  internals.ReactCurrentBatchConfig = { transition: null };
}

if (!internals.ReactCurrentDispatcher) {
  const clientInternals = R.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE as Record<string, unknown> | undefined;
  internals.ReactCurrentDispatcher = { current: clientInternals?.H ?? null };
}
