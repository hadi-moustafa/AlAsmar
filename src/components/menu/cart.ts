"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type CartLine = {
  key: string;
  name: string;
  option?: string;
  unitPrice: number;
  qty: number;
};

const STORAGE_KEY = "alasmar-cart-v1";

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage once
      if (saved) setLines(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, loaded]);

  const add = useCallback((line: Omit<CartLine, "qty">, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.key === line.key);
      if (existing) {
        return prev.map((l) => (l.key === line.key ? { ...l, qty: l.qty + qty } : l));
      }
      return [...prev, { ...line, qty }];
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) =>
      qty <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, qty } : l)),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const { count, total } = useMemo(
    () => ({
      count: lines.reduce((s, l) => s + l.qty, 0),
      total: lines.reduce((s, l) => s + l.qty * l.unitPrice, 0),
    }),
    [lines],
  );

  const qtyOf = useCallback(
    (keyPrefix: string) =>
      lines.filter((l) => l.key === keyPrefix || l.key.startsWith(`${keyPrefix}:`)).reduce((s, l) => s + l.qty, 0),
    [lines],
  );

  return { lines, add, setQty, clear, count, total, qtyOf };
}

export type Cart = ReturnType<typeof useCart>;
