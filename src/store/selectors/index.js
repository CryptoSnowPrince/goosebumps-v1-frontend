import { createSelector, createStructuredSelector } from "reselect";

// Auth Selectors
export const accountState = (state) => state.auth.account;
export const providerState = (state) => state.auth.provider;
