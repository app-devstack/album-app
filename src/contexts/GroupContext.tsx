'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

type GroupContextType = {
  currentGroupId: string | null;
  setCurrentGroupId: (groupId: string | null) => void;
};

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({
  children,
  initialGroupId,
}: {
  children: ReactNode;
  initialGroupId: string | null;
}) {
  const [currentGroupId, setGroupIdState] = useState(initialGroupId);

  const setCurrentGroupId = (groupId: string | null) => {
    if (groupId) {
      document.cookie = `currentGroupId=${groupId}; path=/; max-age=31536000; SameSite=Lax`;
    } else {
      document.cookie = `currentGroupId=; path=/; max-age=0`;
    }
    setGroupIdState(groupId);
  };

  return (
    <GroupContext.Provider value={{ currentGroupId, setCurrentGroupId }}>
      {children}
    </GroupContext.Provider>
  );
}

export const useGroupContext = () => {
  const context = useContext(GroupContext);
  if (!context) throw new Error('useGroup must be used within GroupProvider');
  return context;
};
