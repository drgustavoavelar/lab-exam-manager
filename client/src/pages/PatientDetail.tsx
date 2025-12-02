import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Upload, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { storagePut } from "@/lib/storage";

export default function PatientDetail() {
  const [, params] = useRoute("/patients/:id");
  const [, setLocation] = useLocation();
  const patientId = params?.id ? parseInt(params.id) : 0;

  const { data: patient, isLoading: patientLoading } = trpc.patients.getById.useQuery({ id: patientId });
  const { data: examRequests, refetch: refetchRequests } = trpc.examRequests.listByPatient.useQuery({ patientId });

  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);

  if (patientLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Paciente não encontrado</p>
            <Button className="mt-4" onClick={() => setLocation("/patients")}>
              Voltar para Pacientes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => setLocation("/patients")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{patient.name}</CardTitle>
            <CardDescription>Informações do Paciente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {patient.cpf && <div><strong>CPF:</strong> {patient.cpf}</div>}
            {patient.birthDate && (
              <div>
                <strong>Data de Nascimento:</strong>{" "}
                {format(new Date(patient.birthDate), "dd/MM/yyyy", { locale: ptBR })}
              </div>
            )}
            {patient.phone && <div><strong>Telefone:</strong> {patient.phone}</div>}
            {patient.email && <div><strong>E-mail:</strong> {patient.email}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Adicionar Pedido
                </Button>
              </DialogTrigger>
              <DialogContent>
                <UploadRequestDialog
                  patientId={patientId}
                  onSuccess={() => {
                    setRequestDialogOpen(false);
                    refetchRequests();
                  }}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">Pedidos de Exames</TabsTrigger>
        </TabsList>
        <TabsContent value="requests">
          {!examRequests || examRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum pedido de exame cadastrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {examRequests.map((request) => (
                <ExamRequestCard
                  key={request.id}
                  request={request}
                  onAddResult={() => {
                    setSelectedRequestId(request.id);
                    setResultDialogOpen(true);
                  }}
                  onRefresh={refetchRequests}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent>
          {selectedRequestId && (
            <UploadResultDialog
              requestId={selectedRequestId}
              onSuccess={() => {
                setResultDialogOpen(false);
                refetchRequests();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UploadRequestDialog({ patientId, onSuccess }: { patientId: number; onSuccess: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    requestDate: new Date().toISOString().split("T")[0],
    doctorName: "",
  });

  const createRequest = trpc.examRequests.create.useMutation({
    onSuccess: () => {
      toast.success("Pedido de exame cadastrado com sucesso!");
      onSuccess();
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar pedido: " + error.message);
      setUploading(false);
    },
  });

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      toast.error("Selecione um arquivo PDF");
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("Apenas arquivos PDF são aceitos");
      return;
    }

    setUploading(true);

    try {
      const fileKey = `exam-requests/${patientId}/${Date.now()}-${file.name}`;
      const { url } = await storagePut(fileKey, file, "application/pdf");

      createRequest.mutate({
        patientId,
        requestDate: formData.requestDate,
        doctorName: formData.doctorName || undefined,
        pdfUrl: url,
        pdfKey: fileKey,
      });
    } catch (error) {
      toast.error("Erro ao fazer upload do arquivo");
      setUploading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Adicionar Pedido de Exames</DialogTitle>
        <DialogDescription>
          Faça upload do PDF com o pedido médico de exames
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleFileUpload} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="requestDate">Data do Pedido</Label>
          <Input
            id="requestDate"
            type="date"
            value={formData.requestDate}
            onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="doctorName">Nome do Médico</Label>
          <Input
            id="doctorName"
            value={formData.doctorName}
            onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
            placeholder="Dr. João Silva"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pdfFile">Arquivo PDF</Label>
          <Input id="pdfFile" type="file" accept=".pdf" required />
        </div>
        <Button type="submit" disabled={uploading} className="w-full">
          {uploading ? "Processando..." : "Enviar Pedido"}
        </Button>
      </form>
    </>
  );
}

function UploadResultDialog({ requestId, onSuccess }: { requestId: number; onSuccess: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    resultDate: new Date().toISOString().split("T")[0],
    laboratoryName: "",
  });

  const createResult = trpc.examResults.create.useMutation({
    onSuccess: (data) => {
      toast.success("Resultado cadastrado e análise concluída!");
      if (data.compliance) {
        toast.info(data.compliance.details);
      }
      onSuccess();
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar resultado: " + error.message);
      setUploading(false);
    },
  });

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      toast.error("Selecione um arquivo PDF");
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("Apenas arquivos PDF são aceitos");
      return;
    }

    setUploading(true);

    try {
      const fileKey = `exam-results/${requestId}/${Date.now()}-${file.name}`;
      const { url } = await storagePut(fileKey, file, "application/pdf");

      createResult.mutate({
        examRequestId: requestId,
        resultDate: formData.resultDate,
        laboratoryName: formData.laboratoryName || undefined,
        pdfUrl: url,
        pdfKey: fileKey,
      });
    } catch (error) {
      toast.error("Erro ao fazer upload do arquivo");
      setUploading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Adicionar Resultado de Exames</DialogTitle>
        <DialogDescription>
          Faça upload do PDF com os resultados dos exames realizados
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleFileUpload} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="resultDate">Data do Resultado</Label>
          <Input
            id="resultDate"
            type="date"
            value={formData.resultDate}
            onChange={(e) => setFormData({ ...formData, resultDate: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="laboratoryName">Nome do Laboratório</Label>
          <Input
            id="laboratoryName"
            value={formData.laboratoryName}
            onChange={(e) => setFormData({ ...formData, laboratoryName: e.target.value })}
            placeholder="Laboratório XYZ"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pdfFile">Arquivo PDF</Label>
          <Input id="pdfFile" type="file" accept=".pdf" required />
        </div>
        <Button type="submit" disabled={uploading} className="w-full">
          {uploading ? "Processando e Analisando..." : "Enviar Resultado"}
        </Button>
      </form>
    </>
  );
}

function ExamRequestCard({ request, onAddResult, onRefresh }: any) {
  const { data: results } = trpc.examResults.listByRequest.useQuery({ requestId: request.id });
  const { data: requestDetails } = trpc.examRequests.getById.useQuery({ id: request.id });

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "partial":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getComplianceLabel = (status: string) => {
    switch (status) {
      case "complete":
        return "Completo";
      case "partial":
        return "Parcial";
      case "pending":
        return "Pendente";
      default:
        return "Não Analisado";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              Pedido de {format(new Date(request.requestDate), "dd/MM/yyyy", { locale: ptBR })}
            </CardTitle>
            {request.doctorName && (
              <CardDescription>Dr(a). {request.doctorName}</CardDescription>
            )}
          </div>
          <Button size="sm" onClick={onAddResult}>
            <Upload className="mr-2 h-4 w-4" />
            Adicionar Resultado
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {requestDetails?.items && requestDetails.items.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Exames Solicitados ({requestDetails.items.length}):</h4>
            <div className="flex flex-wrap gap-2">
              {requestDetails.items.map((item: any) => (
                <Badge key={item.id} variant="outline">
                  {item.examName}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {results && results.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Resultados:</h4>
            <div className="space-y-2">
              {results.map((result: any) => (
                <div key={result.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">
                      {format(new Date(result.resultDate), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                    {result.laboratoryName && (
                      <div className="text-sm text-muted-foreground">{result.laboratoryName}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getComplianceIcon(result.complianceStatus)}
                    <span className="text-sm font-medium">{getComplianceLabel(result.complianceStatus)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {request.pdfUrl && (
          <div className="pt-2">
            <a
              href={request.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              Ver PDF do Pedido
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
