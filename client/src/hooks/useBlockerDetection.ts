import { useEffect, useState } from "react";

export function useBlockerDetection() {
  const [isBlocked, setIsBlocked] = useState(false);
  const [checkedOnce, setCheckedOnce] = useState(false);

  useEffect(() => {
    // Espera 2 segundos após o carregamento para verificar
    const timer = setTimeout(() => {
      // Verifica se há erros de carregamento no console
      const hasErrors = checkForBlockedResources();
      setIsBlocked(hasErrors);
      setCheckedOnce(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return { isBlocked, checkedOnce };
}

function checkForBlockedResources(): boolean {
  // Verifica se há recursos bloqueados através de performance API
  try {
    const resources = performance.getEntriesByType("resource");
    const blockedCount = resources.filter((resource: any) => {
      // Recursos com transferSize 0 podem estar bloqueados
      return resource.transferSize === 0 && resource.decodedBodySize === 0;
    }).length;

    // Se mais de 3 recursos estão bloqueados, provavelmente é um adblocker
    if (blockedCount > 3) {
      return true;
    }

    // Tenta fazer uma requisição de teste para detectar bloqueios
    const testElement = document.createElement("div");
    testElement.className = "ad advertisement banner-ad";
    testElement.style.position = "absolute";
    testElement.style.left = "-9999px";
    document.body.appendChild(testElement);

    const isHidden =
      testElement.offsetHeight === 0 ||
      window.getComputedStyle(testElement).display === "none";

    document.body.removeChild(testElement);

    return isHidden;
  } catch (error) {
    console.error("Erro ao detectar bloqueios:", error);
    return false;
  }
}
