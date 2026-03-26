import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ChitGroup, Member, Auction, Contribution } from '../../../shared/schema';

const API_BASE = import.meta.env?.VITE_API_BASE || 'http://localhost:5000/api';

// --- GROUPS ---
export function useGroups() {
  return useQuery<ChitGroup[]>({
    queryKey: ['groups'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/groups`);
      if (!res.ok) throw new Error('Failed to fetch groups');
      return res.json();
    },
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newGroup: Partial<ChitGroup>) => {
      const res = await fetch(`${API_BASE}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroup),
      });
      if (!res.ok) throw new Error('Failed to create group');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

// --- MEMBERS ---
export function useMembers(groupId: number) {
  return useQuery<Member[]>({
    queryKey: ['groups', groupId, 'members'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/groups/${groupId}/members`);
      if (!res.ok) throw new Error('Failed to fetch members');
      return res.json();
    },
    enabled: !!groupId,
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newMember: Partial<Member>) => {
      const res = await fetch(`${API_BASE}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      });
      if (!res.ok) throw new Error('Failed to create member');
      return res.json();
    },
    onSuccess: (_, variables) => {
      if (variables.groupId) {
        queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId, 'members'] });
      }
    },
  });
}

// --- AUCTIONS ---
export function useAuctions(groupId: number) {
  return useQuery<Auction[]>({
    queryKey: ['groups', groupId, 'auctions'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/groups/${groupId}/auctions`);
      if (!res.ok) throw new Error('Failed to fetch auctions');
      return res.json();
    },
    enabled: !!groupId,
  });
}

export function useCreateAuction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newAuction: Partial<Auction>) => {
      const res = await fetch(`${API_BASE}/auctions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAuction),
      });
      if (!res.ok) throw new Error('Failed to create auction');
      return res.json();
    },
    onSuccess: (_, variables) => {
      if (variables.groupId) {
        queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId, 'auctions'] });
      }
    },
  });
}

// --- CONTRIBUTIONS ---
export function useContributions(auctionId: number) {
  return useQuery<Contribution[]>({
    queryKey: ['auctions', auctionId, 'contributions'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/auctions/${auctionId}/contributions`);
      if (!res.ok) throw new Error('Failed to fetch contributions');
      return res.json();
    },
    enabled: !!auctionId,
  });
}

export function useCreateContribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newContribution: Partial<Contribution>) => {
      const res = await fetch(`${API_BASE}/contributions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContribution),
      });
      if (!res.ok) throw new Error('Failed to create contribution');
      return res.json();
    },
    onSuccess: (_, variables) => {
      if (variables.auctionId) {
        queryClient.invalidateQueries({ queryKey: ['auctions', variables.auctionId, 'contributions'] });
      }
    },
  });
}
