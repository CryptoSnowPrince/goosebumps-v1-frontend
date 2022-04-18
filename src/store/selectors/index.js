import { createSelector, createStructuredSelector } from "reselect";

// Auth Selectors
export const providerState = (state) => state.auth.provider;
export const web3ProviderState = (state) => state.auth.web3Provider;
export const signerState = (state) => state.auth.signer;
export const accountState = (state) => state.auth.account;
export const chainIdState = (state) => state.auth.chainId;

// Select Chain Selectors
export const chainState = (state) => state.chain.chain
