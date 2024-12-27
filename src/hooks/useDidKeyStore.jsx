import { create } from "zustand";

const useDidKeyStore = create((set) => ({
  didKey: "",
  setDidKey: (key) => set({ didKey: key }),
  secretMode: false, // Default value for secret mode
  enableSecretMode: () => set({ secretMode: true }), // Function to enable secret mode
}));

export default useDidKeyStore;
