import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLoginUrl } from "@/const";
import { FileText, Upload, CheckCircle2, AlertCircle, Clock, Loader2 } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { storagePut } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [step, setStep] = useState<"request" | "result" | "analysis">("request");
  const [currentAnalysisId, setCurrentAnalysisId] = useState<number | null>(null);
  
  // Estado do pedido
  const [requestText, setRequestText] = useState("");
  const [requestPdfFile, setRequestPdfFile] = useState<File | null>(null);
  const [requestInputMethod, setRequestInputMethod] = useState<"text" | "pdf">("text");
  const [patientName, setPatientName] = useState("");
  
  // Estado do resultado
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const createAnalysis = trpc.examAnalyses.create.useMutation({
    onSuccess: (data) => {
      setCurrentAnalysisId(data.id);
      setStep("result");
      toast.success(`Pedido processado! ${data.requestedExamsCount} exames identificados.`);
    },
    onError: (error) => {
      toast.error("Erro ao processar pedido: " + error.message);
    },
  });

  const addResult = trpc.examAnalyses.addResult.useMutation({
    onSuccess: (data) => {
      setStep("analysis");
      toast.success("Resultado processado! Análise de conformidade concluída.");
      refetchAnalysis();
    },
    onError: (error) => {
      toast.error("Erro ao processar resultado: " + error.message);
      setUploading(false);
    },
  });

  const { data: analysisData, refetch: refetchAnalysis } = trpc.examAnalyses.getById.useQuery(
    { id: currentAnalysisId! },
    { enabled: !!currentAnalysisId && step === "analysis" }
  );

  const { data: recentAnalyses } = trpc.examAnalyses.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const handleSubmitRequest = async () => {
    if (requestInputMethod === "text" && !requestText.trim()) {
      toast.error("Digite o texto do pedido de exames");
      return;
    }

    if (requestInputMethod === "pdf" && !requestPdfFile) {
      toast.error("Selecione o arquivo PDF do pedido");
      return;
    }

    setUploading(true);

    try {
      let pdfUrl: string | undefined;
      let pdfKey: string | undefined;

      if (requestInputMethod === "pdf" && requestPdfFile) {
        const fileKey = `exam-requests/${Date.now()}-${requestPdfFile.name}`;
        const result = await storagePut(fileKey, requestPdfFile, "application/pdf");
        pdfUrl = result.url;
        pdfKey = fileKey;
      }

      createAnalysis.mutate({
        patientName: patientName || undefined,
        requestText: requestInputMethod === "text" ? requestText : undefined,
        requestPdfUrl: pdfUrl,
        requestPdfKey: pdfKey,
        requestDate: new Date().toISOString(),
      });
    } catch (error) {
      toast.error("Erro ao fazer upload do arquivo");
      setUploading(false);
    }
  };

  const handleSubmitResult = async () => {
    if (!resultFile) {
      toast.error("Selecione o arquivo do resultado (PDF ou imagem)");
      return;
    }

    if (!currentAnalysisId) {
      toast.error("Erro: análise não encontrada");
      return;
    }

    setUploading(true);

    try {
      const fileType = resultFile.type.includes("pdf") ? "pdf" : "image";
      const contentType = fileType === "pdf" ? "application/pdf" : resultFile.type;
      const fileKey = `exam-results/${currentAnalysisId}/${Date.now()}-${resultFile.name}`;
      
      const result = await storagePut(fileKey, resultFile, contentType);

      addResult.mutate({
        analysisId: currentAnalysisId,
        resultFileUrl: result.url,
        resultFileKey: fileKey,
        resultFileType: fileType,
        resultDate: new Date().toISOString(),
      });
    } catch (error) {
      toast.error("Erro ao fazer upload do arquivo");
      setUploading(false);
    }
  };

  const handleReset = () => {
    setStep("request");
    setCurrentAnalysisId(null);
    setRequestText("");
    setRequestPdfFile(null);
    setPatientName("");
    setResultFile(null);
    setUploading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Compatibilidade de Exames
              </h1>
              <p className="text-2xl font-semibold text-gray-700 mb-2">
                Instituto Elo de Saúde
              </p>
              <p className="text-lg text-gray-600">
                Verifique automaticamente se todos os exames solicitados foram realizados
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-white/80 backdrop-blur">
                <CardHeader>
                  <FileText className="h-10 w-10 text-blue-600 mx-auto mb-2" />
                  <CardTitle>Cole ou Envie o Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Digite o texto ou faça upload do PDF com os exames solicitados
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur">
                <CardHeader>
                  <Upload className="h-10 w-10 text-blue-600 mx-auto mb-2" />
                  <CardTitle>Envie o Resultado</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Faça upload do PDF ou imagem com os resultados dos exames
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur">
                <CardHeader>
                  <CheckCircle2 className="h-10 w-10 text-blue-600 mx-auto mb-2" />
                  <CardTitle>Veja a Análise</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Receba instantaneamente a análise de conformidade completa
                  </p>
                </CardContent>
              </Card>
            </div>

            <Button size="lg" asChild className="text-lg px-8">
              <a href={getLoginUrl()}>
                Começar Agora
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Compatibilidade de Exames
            </h1>
            <p className="text-xl font-semibold text-gray-700">Instituto Elo de Saúde</p>
          </div>

          {step === "request" && (
            <Card className="bg-white/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Passo 1: Pedido de Exames
                </CardTitle>
                <CardDescription>
                  Cole o texto ou faça upload do PDF com os exames solicitados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Nome do Paciente (opcional)</Label>
                  <Input
                    id="patientName"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Digite o nome do paciente"
                  />
                </div>

                <Tabs value={requestInputMethod} onValueChange={(v) => setRequestInputMethod(v as "text" | "pdf")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text">Colar Texto</TabsTrigger>
                    <TabsTrigger value="pdf">Upload PDF</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="text" className="space-y-2">
                    <Label htmlFor="requestText">Texto do Pedido</Label>
                    <Textarea
                      id="requestText"
                      value={requestText}
                      onChange={(e) => setRequestText(e.target.value)}
                      placeholder="Cole aqui o texto com os exames solicitados...&#10;&#10;Exemplo:&#10;- Hemograma completo&#10;- Glicose em jejum&#10;- Colesterol total e frações&#10;- TSH e T4 livre"
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </TabsContent>
                  
                  <TabsContent value="pdf" className="space-y-2">
                    <Label htmlFor="requestPdf">Arquivo PDF do Pedido</Label>
                    <Input
                      id="requestPdf"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setRequestPdfFile(e.target.files?.[0] || null)}
                    />
                    {requestPdfFile && (
                      <p className="text-sm text-muted-foreground">
                        Arquivo selecionado: {requestPdfFile.name}
                      </p>
                    )}
                  </TabsContent>
                </Tabs>

                <Button 
                  onClick={handleSubmitRequest} 
                  disabled={uploading || createAnalysis.isPending}
                  className="w-full"
                  size="lg"
                >
                  {uploading || createAnalysis.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Continuar para Resultado"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {step === "result" && (
            <Card className="bg-white/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Passo 2: Resultado dos Exames
                </CardTitle>
                <CardDescription>
                  Faça upload do PDF ou imagem (JPG/PNG) com os resultados dos exames realizados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resultFile">Arquivo do Resultado (PDF ou Imagem)</Label>
                  <Input
                    id="resultFile"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setResultFile(e.target.files?.[0] || null)}
                  />
                  {resultFile && (
                    <p className="text-sm text-muted-foreground">
                      Arquivo selecionado: {resultFile.name} ({resultFile.type})
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={handleReset}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button 
                    onClick={handleSubmitResult}
                    disabled={uploading || addResult.isPending || !resultFile}
                    className="flex-1"
                  >
                    {uploading || addResult.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      "Analisar Conformidade"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "analysis" && analysisData && (
            <Card className="bg-white/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Análise de Conformidade
                </CardTitle>
                <CardDescription>
                  Resultado da comparação entre pedido e resultado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-center p-6 bg-muted rounded-lg">
                  <div className="text-center">
                    {analysisData.complianceStatus === "complete" && (
                      <>
                        <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-3" />
                        <h3 className="text-2xl font-bold text-green-600">Completo</h3>
                      </>
                    )}
                    {analysisData.complianceStatus === "partial" && (
                      <>
                        <AlertCircle className="h-16 w-16 text-yellow-600 mx-auto mb-3" />
                        <h3 className="text-2xl font-bold text-yellow-600">Parcial</h3>
                      </>
                    )}
                    {analysisData.complianceStatus === "pending" && (
                      <>
                        <Clock className="h-16 w-16 text-gray-600 mx-auto mb-3" />
                        <h3 className="text-2xl font-bold text-gray-600">Pendente</h3>
                      </>
                    )}
                    {analysisData.complianceDetails && (
                      <p className="text-muted-foreground mt-2">
                        {analysisData.complianceDetails.details}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Exames Solicitados ({analysisData.requestedExams.length})
                    </h4>
                    <div className="space-y-2">
                      {analysisData.requestedExams.map((exam: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="block w-full justify-start text-left">
                          {exam}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Exames Realizados ({analysisData.performedExams.length})
                    </h4>
                    <div className="space-y-2">
                      {analysisData.performedExams.map((exam: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="block w-full justify-start text-left bg-green-50">
                          {exam}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {analysisData.missingExams.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-red-600 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Exames Faltantes ({analysisData.missingExams.length})
                    </h4>
                    <div className="space-y-2">
                      {analysisData.missingExams.map((exam: string, idx: number) => (
                        <Badge key={idx} variant="destructive" className="block w-full justify-start text-left">
                          {exam}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {analysisData.extraExams.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-blue-600 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Exames Adicionais ({analysisData.extraExams.length})
                    </h4>
                    <div className="space-y-2">
                      {analysisData.extraExams.map((exam: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="block w-full justify-start text-left">
                          {exam}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={handleReset} className="w-full" size="lg">
                  Nova Análise
                </Button>
              </CardContent>
            </Card>
          )}

          {recentAnalyses && recentAnalyses.length > 0 && step === "request" && (
            <Card className="mt-6 bg-white/90 backdrop-blur">
              <CardHeader>
                <CardTitle>Análises Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentAnalyses.slice(0, 5).map((analysis) => (
                    <div
                      key={analysis.id}
                      className="p-3 bg-muted rounded-lg flex justify-between items-center cursor-pointer hover:bg-muted/80"
                      onClick={() => {
                        setCurrentAnalysisId(analysis.id);
                        setStep("analysis");
                      }}
                    >
                      <div>
                        <p className="font-medium">
                          {analysis.patientName || "Sem nome"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(analysis.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <Badge>
                        {analysis.complianceStatus === "complete" && "Completo"}
                        {analysis.complianceStatus === "partial" && "Parcial"}
                        {analysis.complianceStatus === "pending" && "Pendente"}
                        {analysis.complianceStatus === "not_analyzed" && "Não Analisado"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
