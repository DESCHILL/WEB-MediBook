import { useEffect as use_effect, useState as use_state } from 'react';
import { send_auth_request } from '../services/auth_api.js';

export function use_auth() {
    const [account, set_account] = use_state(null);
    const [loading, set_loading] = use_state(true);
    const [error, set_error] = use_state('');
    const [pending, set_pending] = use_state(false);
    use_effect(() => {
        let active = true;
        send_auth_request('me').then((data) => { if (active) set_account(data.account); }).catch((failure) => {
            if (active && failure.status !== 401) set_error(failure.message);
        }).finally(() => { if (active) set_loading(false); });
        return () => { active = false; };
    }, []);
    async function logout() {
        set_pending(true); set_error('');
        try { await send_auth_request('logout', {}); }
        catch (failure) { if (failure.status !== 401) { set_error(failure.message); set_pending(false); return; } }
        set_account(null); set_pending(false); window.location.assign('/dang_nhap');
    }
    return { account, loading, error, pending, logout };
}
