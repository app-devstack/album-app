'use client';

import { Group } from '@/db/schema';
import { useGroup } from '@/hooks/fetchers/use-groups';
import { DefaultError, UseQueryResult } from '@tanstack/react-query';
import { createContext, ReactNode, useContext, useState } from 'react';

type GroupContextType = {
  currentGroupId: string;
  setCurrentGroupId: (groupId: string) => void;
  currentGroup: UseQueryResult<Group, DefaultError>;
};

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({
  children,
  initialGroupId,
}: {
  children: ReactNode;
  initialGroupId: string;
}) {
  const [currentGroupId, setGroupIdState] = useState<string>(initialGroupId);
  const currentGroup = useGroup(currentGroupId);

  const setCurrentGroupId = (groupId: string) => {
    if (groupId) {
      document.cookie = `currentGroupId=${groupId}; path=/; max-age=31536000; SameSite=Lax`;
    } else {
      document.cookie = `currentGroupId=; path=/; max-age=0`;
    }
    setGroupIdState(groupId);
  };

  return (
    <GroupContext.Provider
      value={{
        currentGroupId,
        setCurrentGroupId,
        currentGroup,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export const useGroupContext = () => {
  const context = useContext(GroupContext);
  if (!context) throw new Error('useGroup must be used within GroupProvider');
  return context;
};
