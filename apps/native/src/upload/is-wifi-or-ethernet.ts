import * as Network from 'expo-network';

/** 端末が Wi-Fi または Ethernet に接続しているか判定する。 */
export async function isWifiOrEthernet(): Promise<boolean> {
  try {
    const state = await Network.getNetworkStateAsync();
    const isConnected = state.isConnected === true;
    const type = state.type;

    if (!isConnected) {
      return false;
    }

    if (type === Network.NetworkStateType.WIFI) {
      return true;
    }

    if (type === Network.NetworkStateType.ETHERNET) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
