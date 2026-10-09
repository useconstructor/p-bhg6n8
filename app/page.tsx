"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEYS = {
  j1Nombre: "marcador_j1_nombre",
  j1Puntaje: "marcador_j1_puntaje",
  j2Nombre: "marcador_j2_nombre",
  j2Puntaje: "marcador_j2_puntaje",
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    if (typeof defaultValue === "number") {
      const parsed = parseInt(stored, 10);
      return (isNaN(parsed) ? defaultValue : parsed) as T;
    }
    return stored as T;
  } catch {
    return defaultValue;
  }
}

function saveToStorage(key: string, value: string | number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Storage full or unavailable
  }
}

export default function MarcadorDePuntos() {
  const [j1Nombre, setJ1Nombre] = useState("");
  const [j2Nombre, setJ2Nombre] = useState("");
  const [j1Puntaje, setJ1Puntaje] = useState(0);
  const [j2Puntaje, setJ2Puntaje] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  const j1DebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const j2DebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const j1VersionRef = useRef(0);
  const j2VersionRef = useRef(0);

  useEffect(() => {
    setJ1Nombre(loadFromStorage(STORAGE_KEYS.j1Nombre, ""));
    setJ2Nombre(loadFromStorage(STORAGE_KEYS.j2Nombre, ""));
    setJ1Puntaje(loadFromStorage(STORAGE_KEYS.j1Puntaje, 0));
    setJ2Puntaje(loadFromStorage(STORAGE_KEYS.j2Puntaje, 0));
    setMounted(true);
  }, []);

  const debouncedSaveNombre = useCallback(
    (key: string, value: string, versionRef: React.MutableRefObject<number>) => {
      const currentVersion = ++versionRef.current;
      const debounceRef = key === STORAGE_KEYS.j1Nombre ? j1DebounceRef : j2DebounceRef;

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        if (versionRef.current === currentVersion) {
          const truncated = value.slice(0, 20);
          saveToStorage(key, truncated);
        }
      }, 500);
    },
    []
  );

  const handleJ1NombreChange = (value: string) => {
    setJ1Nombre(value);
    debouncedSaveNombre(STORAGE_KEYS.j1Nombre, value, j1VersionRef);
  };

  const handleJ2NombreChange = (value: string) => {
    setJ2Nombre(value);
    debouncedSaveNombre(STORAGE_KEYS.j2Nombre, value, j2VersionRef);
  };

  const incrementJ1 = () => {
    const newValue = j1Puntaje + 1;
    setJ1Puntaje(newValue);
    saveToStorage(STORAGE_KEYS.j1Puntaje, newValue);
  };

  const decrementJ1 = () => {
    if (j1Puntaje > 0) {
      const newValue = j1Puntaje - 1;
      setJ1Puntaje(newValue);
      saveToStorage(STORAGE_KEYS.j1Puntaje, newValue);
    }
  };

  const incrementJ2 = () => {
    const newValue = j2Puntaje + 1;
    setJ2Puntaje(newValue);
    saveToStorage(STORAGE_KEYS.j2Puntaje, newValue);
  };

  const decrementJ2 = () => {
    if (j2Puntaje > 0) {
      const newValue = j2Puntaje - 1;
      setJ2Puntaje(newValue);
      saveToStorage(STORAGE_KEYS.j2Puntaje, newValue);
    }
  };

  const handleReiniciar = () => {
    setShowConfirm(true);
  };

  const confirmarReinicio = () => {
    setJ1Puntaje(0);
    setJ2Puntaje(0);
    saveToStorage(STORAGE_KEYS.j1Puntaje, 0);
    saveToStorage(STORAGE_KEYS.j2Puntaje, 0);
    setShowConfirm(false);
  };

  const cancelarReinicio = () => {
    setShowConfirm(false);
  };

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center p-5">
        <div className="text-[var(--color-text-muted)]">Cargando...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-5">
      <div className="max-w-[800px] mx-auto">
        <h1 className="text-center text-2xl font-semibold text-[var(--color-text)] mb-8">
          Marcador de Puntos
        </h1>

        <div className="flex flex-col md:flex-row md:justify-between md:gap-[20%]">
          <PlayerColumn
            nombre={j1Nombre}
            puntaje={j1Puntaje}
            placeholder="Nombre Jugador 1"
            onNombreChange={handleJ1NombreChange}
            onIncrement={incrementJ1}
            onDecrement={decrementJ1}
          />
          <PlayerColumn
            nombre={j2Nombre}
            puntaje={j2Puntaje}
            placeholder="Nombre Jugador 2"
            onNombreChange={handleJ2NombreChange}
            onIncrement={incrementJ2}
            onDecrement={decrementJ2}
          />
        </div>

        <div className="mt-8">
          {showConfirm ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-[var(--color-text)] font-medium">
                ¿Reiniciar puntos?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={cancelarReinicio}
                  className="px-6 py-2 text-base font-semibold bg-[var(--color-button-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded hover:bg-[var(--color-button-hover)] active:bg-[var(--color-button-active)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarReinicio}
                  className="px-6 py-2 text-base font-semibold bg-[var(--color-primary)] text-white rounded hover:bg-[#555555] transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleReiniciar}
              className="w-full h-10 text-base font-semibold bg-[var(--color-primary)] text-white rounded hover:bg-[#555555] transition-colors"
            >
              Reiniciar
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

interface PlayerColumnProps {
  nombre: string;
  puntaje: number;
  placeholder: string;
  onNombreChange: (value: string) => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

function PlayerColumn({
  nombre,
  puntaje,
  placeholder,
  onNombreChange,
  onIncrement,
  onDecrement,
}: PlayerColumnProps) {
  return (
    <div className="flex-1 md:w-[40%] mb-8 md:mb-0">
      <input
        type="text"
        value={nombre}
        onChange={(e) => onNombreChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-base font-normal p-2 border border-[var(--color-border)] rounded bg-[var(--color-bg)] text-[var(--color-text)] focus:border-[var(--color-border-focus)] focus:outline-none transition-colors"
      />

      <div className="mt-5 min-h-[60px] flex items-center justify-center">
        <span className="text-5xl font-bold text-black">{puntaje}</span>
      </div>

      <div className="flex justify-center gap-2.5 mt-4">
        <button
          onClick={onDecrement}
          className="w-12 h-10 text-lg font-semibold bg-[var(--color-button-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded hover:bg-[var(--color-button-hover)] active:bg-[var(--color-button-active)] transition-colors"
        >
          -1
        </button>
        <button
          onClick={onIncrement}
          className="w-12 h-10 text-lg font-semibold bg-[var(--color-button-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded hover:bg-[var(--color-button-hover)] active:bg-[var(--color-button-active)] transition-colors"
        >
          +1
        </button>
      </div>
    </div>
  );
}
