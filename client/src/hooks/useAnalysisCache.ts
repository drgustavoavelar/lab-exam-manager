import { useEffect } from "react";

const CACHE_KEY = "exam_analyses_cache";
const CACHE_EXPIRY_DAYS = 7;

interface CachedAnalysis {
  id: number;
  patientName?: string;
  requestedExams: string[];
  performedExams: string[];
  missingExams: string[];
  extraExams: string[];
  status: string;
  createdAt: string;
  cachedAt: number;
}

export function useAnalysisCache() {
  // Limpa cache antigo ao montar
  useEffect(() => {
    cleanExpiredCache();
  }, []);

  const saveToCache = (analysis: Omit<CachedAnalysis, "cachedAt">) => {
    try {
      const cache = getCache();
      const cached: CachedAnalysis = {
        ...analysis,
        cachedAt: Date.now(),
      };
      
      // Adiciona ao início do array (mais recente primeiro)
      cache.unshift(cached);
      
      // Mantém apenas os 50 mais recentes
      const trimmed = cache.slice(0, 50);
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error("Erro ao salvar no cache:", error);
    }
  };

  const getCache = (): CachedAnalysis[] => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return [];
      return JSON.parse(cached);
    } catch (error) {
      console.error("Erro ao ler cache:", error);
      return [];
    }
  };

  const getCachedAnalysis = (id: number): CachedAnalysis | null => {
    const cache = getCache();
    return cache.find((item) => item.id === id) || null;
  };

  const cleanExpiredCache = () => {
    try {
      const cache = getCache();
      const now = Date.now();
      const expiryMs = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      
      const filtered = cache.filter((item) => {
        const age = now - item.cachedAt;
        return age < expiryMs;
      });
      
      if (filtered.length !== cache.length) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(filtered));
        console.log(`Cache limpo: ${cache.length - filtered.length} itens removidos`);
      }
    } catch (error) {
      console.error("Erro ao limpar cache:", error);
    }
  };

  const clearAllCache = () => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error("Erro ao limpar todo o cache:", error);
    }
  };

  return {
    saveToCache,
    getCache,
    getCachedAnalysis,
    cleanExpiredCache,
    clearAllCache,
  };
}
