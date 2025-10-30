
import { create } from "zustand";

export const useAddressStore = create((set) => ({
    selectedAddress: null, // địa chỉ đang được chọn
    needReload: false,
    setSelectedAddress: (address) => set({ selectedAddress: address }),
    clearAddress: () => set({ selectedAddress: null }),
    setNeedReload: (val) => set({ needReload: val }),
}));

