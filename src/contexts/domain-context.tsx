'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type Domain = 'foundation' | 'delivery';

interface DomainContextValue {
  activeDomain: Domain;
  setActiveDomain: (d: Domain) => void;
  deliveryLabel: string;
  setDeliveryLabel: (l: string) => void;
  isInsideProject: boolean;
  setIsInsideProject: (v: boolean) => void;
}

const DomainContext = createContext<DomainContextValue | null>(null);

export function DomainProvider({ children }: { children: ReactNode }) {
  const [activeDomain, setActiveDomain] = useState<Domain>('foundation');
  const [deliveryLabel, setDeliveryLabel] = useState('Novel');
  const [isInsideProject, setIsInsideProject] = useState(false);

  return (
    <DomainContext.Provider
      value={{ activeDomain, setActiveDomain, deliveryLabel, setDeliveryLabel, isInsideProject, setIsInsideProject }}
    >
      {children}
    </DomainContext.Provider>
  );
}

export function useDomain() {
  const ctx = useContext(DomainContext);
  if (!ctx) throw new Error('useDomain must be used within DomainProvider');
  return ctx;
}
