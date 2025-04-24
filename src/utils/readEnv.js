/**
 * @type {string} URL of the blockchain RPC provider
 */
export const blockchainHost = import.meta.env.VITE_BLOCKCHAIN_RPC_PROVIDER;

/**
 * @type {number} Chain ID of the blockchain
 */
export const blockchainChainID = Number(import.meta.env.VITE_BLOCKCHAIN_CHAIN_ID);

/**
 * @type {string} Address of DID_Registry contract
*/
export const didRegistryAddress = import.meta.env.VITE_BLOCKCHAIN_DID_REGISTRY_ADDR;

/**
 * @type {string} Address of Merkle contract
*/
export const merkleAddress = import.meta.env.VITE_BLOCKCHAIN_MERKLE_ADDR;

/**
 * @type {string} Host address for the connector
 */
export const connectorHost = import.meta.env.VITE_CONNECTOR_HOST;

/**
 * @type {number} Port number for the connector
 */
export const connectorPort = Number(import.meta.env.VITE_CONNECTOR_PORT);

/**
 * @type {string} Public URL of connector
 */
export const connectorURL = import.meta.env.VITE_CONNECTOR_PUBLIC_URL;

/**
 * @type {string} Host address for Grafana
 */
export const grafanaURL = import.meta.env.VITE_GRAFANA_URL;

/**
 * @type {string} Dashboard ID or path for Grafana
 */
export const grafanaDashboard = import.meta.env.VITE_GRAFANA_DASHBOARD;
