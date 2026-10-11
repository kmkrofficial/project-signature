import { ImageResponse } from "next/og";
import { WORDMARK_PATH, WORDMARK_VIEW_BOX } from "@/components/layout/Wordmark";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

interface OgCardProps {
    eyebrow: string;
    title: string;
    footer: string;
}

/** Branded social card shared by the site and article Open Graph images. */
export function renderOgCard({ eyebrow, title, footer }: OgCardProps): ImageResponse {
    const [, , vbWidth, vbHeight] = WORDMARK_VIEW_BOX.split(" ").map(Number);
    const wordmarkHeight = 34;

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "64px 72px",
                    backgroundColor: "#0d0f12",
                    backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(245,158,11,0.22), transparent)",
                    color: "#f3f4f6",
                }}
            >
                <svg
                    viewBox={WORDMARK_VIEW_BOX}
                    width={(vbWidth / vbHeight) * wordmarkHeight}
                    height={wordmarkHeight}
                    fill="#f59e0b"
                >
                    <path d={WORDMARK_PATH} />
                </svg>

                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div style={{ display: "flex", fontSize: 28, color: "#f59e0b", fontWeight: 600 }}>{eyebrow}</div>
                    <div
                        style={{
                            display: "flex",
                            fontSize: title.length > 60 ? 56 : 68,
                            fontWeight: 800,
                            lineHeight: 1.1,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        {title}
                    </div>
                </div>

                <div style={{ display: "flex", fontSize: 26, color: "#9ca3af" }}>{footer}</div>
            </div>
        ),
        OG_SIZE
    );
}
