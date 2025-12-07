"use client";

import React from "react";
import dynamic from "next/dynamic";
import { firebaseConfig } from "@/lib/firebase";

const FireCMSFirebaseApp = dynamic(
    () => import("@firecms/firebase").then((mod) => mod.FireCMSFirebaseApp),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center w-full h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading CMS...</p>
                </div>
            </div>
        )
    }
);

export default function CMSPage() {
    return (
        <FireCMSFirebaseApp
            name="My Portfolio CMS"
            firebaseConfig={firebaseConfig}
            signInOptions={[
                "password",
                "google.com"
            ]}
        />
    );
}
