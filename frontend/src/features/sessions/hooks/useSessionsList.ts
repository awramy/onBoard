import { useState } from 'react';
import { useSessionsControllerFindAll } from '@/api/generated/react-query';
import type { SessionTab } from '@/features/sessions/components/SessionsTabs';

const PAGE_SIZE = 20;

const TAB_STATUS_STRING: Record<SessionTab, string | undefined> = {
  active: 'planned,in_progress',
  all: undefined,
};

export function useSessionsList(tab: SessionTab) {
  const [currentTab, setCurrentTab] = useState(tab);
  const [take, setTake] = useState(PAGE_SIZE);

  if (currentTab !== tab) {
    setCurrentTab(tab);
    setTake(PAGE_SIZE);
  }

  const status = TAB_STATUS_STRING[tab];

  const params = {
    take,
    skip: 0,
    ...(status ? { status } : {}),
  };

  const { data, isLoading, isFetching } = useSessionsControllerFindAll(params);

  function loadMore() {
    setTake((prev) => prev + PAGE_SIZE);
  }

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasMore = items.length < total;

  return { items, total, isLoading, isFetching, hasMore, loadMore };
}
