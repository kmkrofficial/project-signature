'use client';

import { useEffect } from 'react';
import { analytics } from '@/lib/firebase';

export function FirebaseAnalytics() {
    useEffect(() => {
        if (analytics) {
            analytics.then((analyticsInstance) => {
                if (analyticsInstance) {
                    console.log('Firebase Analytics initialized');
                }
            });
        }
    }, []);

    return null;
}
