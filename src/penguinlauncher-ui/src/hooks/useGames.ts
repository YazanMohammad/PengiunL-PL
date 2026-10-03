import { useState, useEffect, useCallback } from 'react';
import type { Game, Account, SystemInfo } from '../types';
import { api } from '../api/client';

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [swappingAccountId, setSwappingAccountId] = useState<string | null>(null);

  const fetchGames = useCallback(async (rescan = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getGames(rescan);
      setGames(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch games');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAccounts = useCallback(async () => {
    try {
      const data = await api.getAccounts();
      setAccounts(data);
    } catch {
      // Optional
    }
  }, []);

  const fetchSystemInfo = useCallback(async () => {
    try {
      const info = await api.getSystemInfo();
      setSystemInfo(info);
    } catch {
      // Optional fallback
    }
  }, []);

  const rescan = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.scanGames();
      setGames(data);
      await fetchAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      setLoading(false);
    }
  }, [fetchAccounts]);

  const hotSwap = useCallback(async (accountId: string) => {
    try {
      setSwappingAccountId(accountId);
      await api.swapAccount(accountId);
      await fetchAccounts();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to swap account');
      return false;
    } finally {
      setSwappingAccountId(null);
    }
  }, [fetchAccounts]);

  useEffect(() => {
    fetchGames();
    fetchAccounts();
    fetchSystemInfo();
  }, [fetchGames, fetchAccounts, fetchSystemInfo]);

  return {
    games,
    accounts,
    systemInfo,
    loading,
    error,
    swappingAccountId,
    rescan,
    refetch: fetchGames,
    refreshAccounts: fetchAccounts,
    hotSwap,
  };
}
