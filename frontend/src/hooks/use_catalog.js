import { useEffect as use_effect, useState as use_state } from 'react';
import { get_catalog } from '../services/catalog_api.js';

export function use_catalog(path) {
    const [state, set_state] = use_state({ path, data: null, loading: true, error: '' });
    const [attempt, set_attempt] = use_state(0);
    use_effect(() => {
        const controller = new AbortController();
        set_state({ path, data: null, loading: true, error: '' });
        get_catalog(path, controller.signal).then((data) => {
            if (!controller.signal.aborted) set_state({ path, data, loading: false, error: '' });
        }).catch((error) => {
            if (!controller.signal.aborted) set_state({ path, data: null, loading: false, error: error.message, status: error.status });
        });
        return () => controller.abort();
    }, [path, attempt]);
    const visible = state.path === path ? state : { data: null, loading: true, error: '' };
    return { ...visible, retry: () => set_attempt((value) => value + 1) };
}
