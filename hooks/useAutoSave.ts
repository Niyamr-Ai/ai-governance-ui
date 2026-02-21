"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { UseFormWatch, UseFormGetValues } from "react-hook-form";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutoSaveOptions {
  watch: UseFormWatch<any>;
  getValues: UseFormGetValues<any>;
  onSave: (data: any) => Promise<void>;
  interval?: number;
  debounceMs?: number;
}

interface UseAutoSaveReturn {
  status: SaveStatus;
  lastSaved: Date | null;
  saveNow: () => Promise<void>;
}

export function useAutoSave({
  watch,
  getValues,
  onSave,
  interval = 30000,
  debounceMs = 1000,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  const performSave = useCallback(async () => {
    if (isSavingRef.current) return;

    isSavingRef.current = true;
    setStatus("saving");

    try {
      const data = getValues();
      await onSave(data);
      setStatus("saved");
      setLastSaved(new Date());
    } catch (error) {
      console.error("Auto-save failed:", error);
      setStatus("error");
    } finally {
      isSavingRef.current = false;
    }
  }, [getValues, onSave]);

  const saveNow = useCallback(async () => {
    await performSave();
  }, [performSave]);

  useEffect(() => {
    const subscription = watch(() => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        setStatus("idle");
      }, debounceMs);
    });

    return () => {
      subscription.unsubscribe();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [watch, debounceMs]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (status !== "saving" && status !== "error") {
        performSave();
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval, performSave, status]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (status === "saving") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [status]);

  return { status, lastSaved, saveNow };
}
