import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Help() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container max-w-4xl">
        <Button 
          variant="outline" 
          onClick={() => setLocation("/")}
          className="mb-6"
        >
          ← Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              Configuração de Adblocker
            </CardTitle>
            <CardDescription>
              Para usar a aplicação corretamente, você precisa permitir scripts essenciais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Por que isso é necessário?</AlertTitle>
              <AlertDescription>
                Adblockers e extensões de privacidade podem bloquear scripts essenciais da aplicação,
                impedindo o upload de arquivos e análise de exames. Não usamos anúncios ou rastreamento invasivo.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Como configurar:</h3>
              
              {/* uBlock Origin */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">uBlock Origin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>1. Clique no ícone do uBlock Origin na barra de ferramentas</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>2. Clique no botão de "power" (ícone grande azul) para desabilitar neste site</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>3. Recarregue a página (F5 ou Ctrl+R)</p>
                  </div>
                </CardContent>
              </Card>

              {/* AdBlock Plus */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AdBlock / AdBlock Plus</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>1. Clique no ícone do AdBlock na barra de ferramentas</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>2. Clique em "Pausar neste site" ou "Não executar nesta página"</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>3. Recarregue a página (F5 ou Ctrl+R)</p>
                  </div>
                </CardContent>
              </Card>

              {/* Brave Browser */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Brave Browser</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>1. Clique no ícone do escudo (Brave Shields) na barra de endereço</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>2. Desative "Shields" para este site</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>3. A página será recarregada automaticamente</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertTitle>Depois de configurar</AlertTitle>
              <AlertDescription>
                Recarregue a página completamente (Ctrl+Shift+R ou Cmd+Shift+R no Mac) para garantir
                que todos os scripts sejam carregados corretamente.
              </AlertDescription>
            </Alert>

            <div className="pt-4">
              <Button 
                onClick={() => setLocation("/")}
                className="w-full"
                size="lg"
              >
                Voltar para a Aplicação
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
