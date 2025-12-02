import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Users, FileText, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const { data: patients } = trpc.patients.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Gerenciador de Exames Laboratoriais
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Organize pedidos e resultados de exames com verificação automática de conformidade
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-white/80 backdrop-blur">
                <CardHeader>
                  <Users className="h-10 w-10 text-blue-600 mx-auto mb-2" />
                  <CardTitle>Gestão de Pacientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Cadastre e organize informações dos pacientes em um só lugar
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur">
                <CardHeader>
                  <FileText className="h-10 w-10 text-blue-600 mx-auto mb-2" />
                  <CardTitle>Upload de PDFs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Anexe pedidos e resultados de exames em formato PDF
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur">
                <CardHeader>
                  <CheckCircle className="h-10 w-10 text-blue-600 mx-auto mb-2" />
                  <CardTitle>Análise Automática</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Verificação automática de conformidade entre pedido e resultado
                  </p>
                </CardContent>
              </Card>
            </div>

            <Button size="lg" asChild className="text-lg px-8">
              <a href={getLoginUrl()}>
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Bem-vindo, {user?.name}!</h1>
          <p className="text-muted-foreground text-lg">
            Gerencie seus exames laboratoriais de forma eficiente
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Pacientes
              </CardTitle>
              <CardDescription>Total de pacientes cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {patients?.length || 0}
              </div>
              <Link href="/patients">
                <Button variant="link" className="px-0 mt-2">
                  Ver todos <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Ações Rápidas
              </CardTitle>
              <CardDescription>Acesso rápido às funcionalidades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/patients/new">
                <Button variant="outline" className="w-full justify-start">
                  Cadastrar Novo Paciente
                </Button>
              </Link>
              <Link href="/patients">
                <Button variant="outline" className="w-full justify-start">
                  Ver Pacientes
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                Como Funciona
              </CardTitle>
              <CardDescription>Processo simplificado</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                <li>Cadastre o paciente</li>
                <li>Anexe o pedido de exames (PDF)</li>
                <li>Anexe o resultado dos exames (PDF)</li>
                <li>Veja a análise de conformidade automática</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
