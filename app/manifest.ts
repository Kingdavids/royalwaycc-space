import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "RoyalwayCC Space",
        short_name: "RoyalwayCC",
        description:
            "Private event hall rental in Ellicott City, Maryland.",
        start_url: "/",
        display: "standalone",
        background_color: "#141414",
        theme_color: "#141414",
        icons: [
            {
                src: "/images/logo.png",
                sizes: "any",
                type: "image/png",
            },
        ],
    };
}