import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, User } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Patients() {
  const { data: patients, isLoading } = trpc.patients.list.useQuery();

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Pacientes</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os pacientes e seus exames laboratoriais
          </p>
        </div>
        <Link href="/patients/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Paciente
          </Button>
        </Link>
      </div>

      {!patients || patients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum paciente cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece cadastrando seu primeiro paciente
            </p>
            <Link href="/patients/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Paciente
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {patients.map((patient) => (
            <Link key={patient.id} href={`/patients/${patient.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {patient.name}
                  </CardTitle>
                  <CardDescription>
                    {patient.email || patient.phone || "Sem contato"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {patient.cpf && <div>CPF: {patient.cpf}</div>}
                    {patient.birthDate && (
                      <div>
                        Nascimento: {format(new Date(patient.birthDate), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    )}
                    <div className="text-xs mt-2">
                      Cadastrado em {format(new Date(patient.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
