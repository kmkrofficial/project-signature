"use client";

import { useLinkStatus } from "next/link";

/** Marker rendered inside a <Link>; globals.css pulses the link while its navigation is pending. */
export function LinkPending() {
    const { pending } = useLinkStatus();
    return <span aria-hidden="true" className="link-pending" data-pending={pending || undefined} />;
}
