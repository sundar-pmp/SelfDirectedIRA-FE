import { useState, useCallback, useEffect } from 'react';
import type { RegistrationRequest, RegistrationSession } from '@/types/registration';

const STORAGE_KEY = 'registration_session';

// Safe localStorage access
const getLocalStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  return null;
};

interface UseRegistrationStateReturn {
  currentStep: number;
  session: RegistrationSession | null;
  formData: Partial<RegistrationRequest>;
  setStep: (step: number) => void;
  updateFormData: (stepKey: keyof RegistrationRequest, data: any) => void;
  saveSession: () => Promise<void>;
  loadSession: () => Promise<void>;
  clearSession: () => void;
  getLastSaved: () => string | null;
}

const sanitizeFormData = (formData: Partial<RegistrationRequest>): Partial<RegistrationRequest> => {
  if (!formData.accountCreation) {
    return formData;
  }

  const { password, confirmPassword, ...safeAccountCreation } = formData.accountCreation;
  return {
    ...formData,
    accountCreation: safeAccountCreation as any,
  };
};

export function useRegistrationState(): UseRegistrationStateReturn {
  const [currentStep, setCurrentStep] = useState(1);
  const [session, setSession] = useState<RegistrationSession | null>(null);
  const [formData, setFormData] = useState<Partial<RegistrationRequest>>({});

  // Load session from localStorage on mount
  useEffect(() => {
    const storage = getLocalStorage();
    if (storage) {
      const saved = storage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const sanitizedFormData = sanitizeFormData(parsed.formData || {});
          setFormData(sanitizedFormData);
          setCurrentStep(parsed.currentStep || 1);

          // Persist sanitized data back to storage (migration for older sessions)
          const sessionData = {
            ...parsed,
            formData: sanitizedFormData,
          };
          storage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
        } catch (e) {
          console.error('Failed to load saved session:', e);
        }
      }
    }
  }, []);

  const updateFormData = useCallback(
    (stepKey: keyof RegistrationRequest, data: any) => {
      setFormData((prev) => ({
        ...prev,
        [stepKey]: data,
      }));
    },
    []
  );

  const saveSession = useCallback(async () => {
    const storage = getLocalStorage();
    if (storage) {
      const sanitizedFormData = sanitizeFormData(formData);
      const sessionData = {
        currentStep,
        formData: sanitizedFormData,
        lastSavedAt: new Date().toISOString(),
      };
      storage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    }

    // In a real app, also POST to backend: POST /api/registration/progress
    // For now, just save locally
  }, [currentStep, formData]);

  const loadSession = useCallback(async () => {
    // In a real app: GET /api/registration/progress
    // For now, rely on localStorage
    const storage = getLocalStorage();
    if (storage) {
      const saved = storage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const sanitizedFormData = sanitizeFormData(parsed.formData || {});
        setFormData(sanitizedFormData);
        setCurrentStep(parsed.currentStep || 1);

        const sessionData = {
          ...parsed,
          formData: sanitizedFormData,
        };
        storage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
      }
    }
  }, []);

  const clearSession = useCallback(() => {
    const storage = getLocalStorage();
    if (storage) {
      storage.removeItem(STORAGE_KEY);
    }
    setFormData({});
    setCurrentStep(1);
  }, []);

  const getLastSaved = useCallback(() => {
    const storage = getLocalStorage();
    if (storage) {
      const saved = storage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.lastSavedAt || null;
      }
    }
    return null;
  }, []);

  const handleSetStep = useCallback(
    (step: number) => {
      setCurrentStep(step);
      saveSession();
    },
    [saveSession]
  );

  return {
    currentStep,
    session,
    formData,
    setStep: handleSetStep,
    updateFormData,
    saveSession,
    loadSession,
    clearSession,
    getLastSaved,
  };
}
