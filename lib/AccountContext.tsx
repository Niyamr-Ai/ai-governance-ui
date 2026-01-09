"use client";

import { createContext, useContext, useState, useEffect } from "react";

export interface Account {
  account_id: string;
  name: string;
  broker: string;
  type: string;
  currency: string;
  starting_balance: number;
  current_balance: number;
  commission_type?: string;
  commission_value?: number;
}

interface AccountContextType {
  accounts: Account[];
  selectedAccount: Account | null;
  setSelectedAccount: (account: Account | null) => void;
  loading: boolean;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const useAccountContext = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccountContext must be used within AccountProvider");
  }
  return context;
};

export const AccountProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch("/api/accounts");
        const data: Account[] = await res.json();

        setAccounts(data);
        setSelectedAccount(data.length > 0 ? data[0] : null);
      } catch (error) {
        console.error("Error fetching accounts", error);
        setAccounts([]);
        setSelectedAccount(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  return (
    <AccountContext.Provider
      value={{ accounts, selectedAccount, setSelectedAccount, loading }}
    >
      {children}
    </AccountContext.Provider>
  );
};