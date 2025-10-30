import * as Location from "expo-location"; // nếu bạn dùng Expo
import { Platform } from "react-native";

// 🕐 Giới hạn khoảng cách tối thiểu (để tránh gọi lại khi di chuyển ít)
const MIN_DISTANCE = 0.0005; // ~50m
// ⏳ Giới hạn thời gian tối thiểu giữa 2 lần gọi
const MIN_INTERVAL = 5000; // 5 giây

let lastRequestTime = 0;
let lastCoords = null;
let lastAddress = null;

/**
 * Lấy địa chỉ từ toạ độ GPS (latitude, longitude)
 * Ưu tiên Nominatim (OpenStreetMap) — free 100%
 * Có cache và giới hạn tần suất để tránh bị chặn
 */
export async function getAddressFromLocation(latitude, longitude) {
    const now = Date.now();

    // 🔹 Nếu chưa đến 5 giây kể từ lần gọi trước → dùng lại kết quả cũ
    if (now - lastRequestTime < MIN_INTERVAL) {
        console.log("⏳ Đợi chút, đang hạn chế tốc độ gọi API...");
        return lastAddress;
    }

    // 🔹 Nếu chưa di chuyển xa hơn 50m → dùng lại kết quả cũ
    if (
        lastCoords &&
        Math.abs(latitude - lastCoords.lat) < MIN_DISTANCE &&
        Math.abs(longitude - lastCoords.lon) < MIN_DISTANCE
    ) {
        console.log("📍 Vị trí chưa thay đổi đáng kể → dùng cache");
        return lastAddress;
    }

    try {
        console.log("🌍 Gọi Nominatim để lấy địa chỉ...");

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=vi`,
            {
                headers: {
                    // ⚠️ Bắt buộc: ghi rõ thông tin để Nominatim không block
                    "User-Agent": "StudentProject/1.0 (for university use)",
                },
            }
        );

        if (!response.ok) throw new Error("Nominatim request failed");

        const data = await response.json();
        const addr = data.address || {};

        const result = {
            street:
                addr.road ||
                addr.residential ||
                addr.neighbourhood ||
                "Không rõ đường",
            ward: {
                code: "",
                name:
                    addr.suburb ||
                    addr.village ||
                    addr.hamlet ||
                    addr.township ||
                    "Không rõ phường/xã",
            },
            district: {
                code: "",
                name:
                    addr.city_district ||
                    addr.county ||
                    addr.district ||
                    "Không rõ quận/huyện",
            },
            city: {
                code: "",
                name: addr.city || addr.state || "Không rõ tỉnh/thành",
            },
            fullAddress:
                data.display_name ||
                `${addr.road || ""}, ${addr.city || ""}`,
            source: "nominatim",
        };

        // 🔹 Lưu cache
        lastCoords = { lat: latitude, lon: longitude };
        lastAddress = result;
        lastRequestTime = now;

        console.log("✅ Lấy địa chỉ thành công:", result.fullAddress);
        return result;
    } catch (e) {
        console.error("❌ Không lấy được địa chỉ:", e.message);

        const fallback = {
            street: "Không rõ đường",
            ward: { code: "", name: "Không rõ phường/xã" },
            district: { code: "", name: "Không rõ quận/huyện" },
            city: { code: "", name: "Không rõ tỉnh/thành" },
            fullAddress: "Không lấy được địa chỉ",
            source: "fallback",
        };

        lastAddress = fallback;
        return fallback;
    }
}

/**
 * Hàm phụ: Lấy vị trí hiện tại của thiết bị (Expo)
 */
export async function getCurrentLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
        throw new Error("Không được phép truy cập vị trí");
    }

    const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
    });

    return {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
    };
}
