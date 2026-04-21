import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  FileText,
  Languages,
  Sparkles,
  CheckCircle2,
  Clock,
  Globe,
  AlignLeft,
  Link2,
  MessageSquare,
  PenLine,
  Loader2,
  Save,
  FolderOpen,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";

type AIFunction =
  | "translate-en"
  | "translate-zh"
  | "polish"
  | "grammar"
  | "tense"
  | "british"
  | "american"
  | "optimize"
  | "coherence"
  | "paragraph"
  | "continue";

export default function Editor() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/editor/:id");
  
  const [content, setContent] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [title, setTitle] = useState("未命名文档");
  const [documentId, setDocumentId] = useState<number | undefined>(undefined);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState("");

  const utils = trpc.useUtils();

  // Load document if ID is provided
  const { data: document } = trpc.documents.get.useQuery(
    { id: Number(params?.id) },
    { enabled: !!params?.id && !!user }
  );

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content);
      setDocumentId(document.id);
    }
  }, [document]);

  // Save document mutation
  const createDoc = trpc.documents.create.useMutation({
    onSuccess: () => {
      toast.success("文档已保存");
      utils.documents.list.invalidate();
    },
  });

  const updateDoc = trpc.documents.update.useMutation({
    onSuccess: () => {
      toast.success("文档已保存");
      utils.documents.list.invalidate();
    },
  });

  // AI mutations
  const translateMutation = trpc.ai.translate.useMutation();
  const polishMutation = trpc.ai.polish.useMutation();
  const grammarMutation = trpc.ai.checkGrammar.useMutation();
  const tenseMutation = trpc.ai.correctTense.useMutation();
  const convertMutation = trpc.ai.convertEnglish.useMutation();
  const optimizeMutation = trpc.ai.optimizeSentence.useMutation();
  const coherenceMutation = trpc.ai.enhanceCoherence.useMutation();
  const paragraphMutation = trpc.ai.improveParagraph.useMutation();
  const continueMutation = trpc.ai.continueWriting.useMutation();

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("文档内容不能为空");
      return;
    }

    if (documentId) {
      await updateDoc.mutateAsync({
        id: documentId,
        title,
        content,
      });
    } else {
      const result = await createDoc.mutateAsync({
        title,
        content,
      });
      // Note: The API doesn't return the created document ID, so we can't set it here
      toast.success("文档已创建");
    }
  };

  const handleAIProcess = async (func: AIFunction) => {
    const textToProcess = selectedText || content;
    if (!textToProcess.trim()) {
      toast.error("请输入或选择要处理的文本");
      return;
    }

    setProcessing(true);
    setResult("");

    try {
      let response;
      switch (func) {
        case "translate-en":
          response = await translateMutation.mutateAsync({
            text: textToProcess,
            targetLang: "en",
            documentId,
          });
          break;
        case "translate-zh":
          response = await translateMutation.mutateAsync({
            text: textToProcess,
            targetLang: "zh",
            documentId,
          });
          break;
        case "polish":
          response = await polishMutation.mutateAsync({
            text: textToProcess,
            documentId,
          });
          break;
        case "grammar":
          response = await grammarMutation.mutateAsync({
            text: textToProcess,
            documentId,
          });
          break;
        case "tense":
          response = await tenseMutation.mutateAsync({
            text: textToProcess,
            documentId,
          });
          break;
        case "british":
          response = await convertMutation.mutateAsync({
            text: textToProcess,
            variant: "british",
            documentId,
          });
          break;
        case "american":
          response = await convertMutation.mutateAsync({
            text: textToProcess,
            variant: "american",
            documentId,
          });
          break;
        case "optimize":
          response = await optimizeMutation.mutateAsync({
            text: textToProcess,
            documentId,
          });
          break;
        case "coherence":
          response = await coherenceMutation.mutateAsync({
            text: textToProcess,
            documentId,
          });
          break;
        case "paragraph":
          response = await paragraphMutation.mutateAsync({
            text: textToProcess,
            documentId,
          });
          break;
        case "continue":
          response = await continueMutation.mutateAsync({
            context: textToProcess,
            documentId,
          });
          break;
      }

      setResult(response.result);
      toast.success("处理完成");
    } catch (error) {
      toast.error("处理失败，请重试");
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const applyResult = () => {
    if (!result) return;
    
    if (selectedText) {
      // Replace selected text
      setContent(content.replace(selectedText, result));
    } else {
      // Replace entire content
      setContent(result);
    }
    
    setResult("");
    setSelectedText("");
    toast.success("已应用处理结果");
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/documents")}>
              <FolderOpen className="h-5 w-5" />
            </Button>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-none bg-transparent text-xl font-semibold outline-none focus:ring-0"
              placeholder="文档标题"
            />
          </div>
          <Button onClick={handleSave} disabled={createDoc.isPending || updateDoc.isPending}>
            {createDoc.isPending || updateDoc.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            保存
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Area */}
        <div className="flex flex-1 flex-col p-6">
          <Card className="flex-1 overflow-hidden">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onSelect={(e) => {
                const target = e.target as HTMLTextAreaElement;
                const selected = target.value.substring(
                  target.selectionStart,
                  target.selectionEnd
                );
                setSelectedText(selected);
              }}
              placeholder="开始写作..."
              className="h-full resize-none border-none p-6 text-base leading-relaxed focus-visible:ring-0"
            />
          </Card>
        </div>

        {/* AI Tools Panel */}
        <div className="w-96 border-l bg-card p-6">
          <Tabs defaultValue="tools" className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tools">AI 工具</TabsTrigger>
              <TabsTrigger value="result">处理结果</TabsTrigger>
            </TabsList>

            <TabsContent value="tools" className="mt-4 space-y-4">
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="space-y-6 pr-4">
                  {/* Translation */}
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <Languages className="h-4 w-4 text-primary" />
                      学科翻译
                    </h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleAIProcess("translate-en")}
                        disabled={processing}
                      >
                        中译英
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleAIProcess("translate-zh")}
                        disabled={processing}
                      >
                        英译中
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Polish & Grammar */}
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <Sparkles className="h-4 w-4 text-primary" />
                      语言优化
                    </h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleAIProcess("polish")}
                        disabled={processing}
                      >
                        学科润色
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleAIProcess("grammar")}
                        disabled={processing}
                      >
                        语法校对
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleAIProcess("tense")}
                        disabled={processing}
                      >
                        时态校正
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* English Variants */}
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <Globe className="h-4 w-4 text-primary" />
                      英语变体
                    </h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleAIProcess("british")}
                        disabled={processing}
                      >
                        转换为英式英语
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleAIProcess("american")}
                        disabled={processing}
                      >
                        转换为美式英语
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Structure Optimization */}
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <AlignLeft className="h-4 w-4 text-primary" />
                      结构优化
                    </h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleAIProcess("optimize")}
                        disabled={processing}
                      >
                        句式结构优化
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleAIProcess("coherence")}
                        disabled={processing}
                      >
                        逻辑连贯性增强
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleAIProcess("paragraph")}
                        disabled={processing}
                      >
                        段落结构优化
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Continue Writing */}
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <PenLine className="h-4 w-4 text-primary" />
                      智能续写
                    </h3>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleAIProcess("continue")}
                      disabled={processing}
                    >
                      基于上下文续写
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="result" className="mt-4">
              <ScrollArea className="h-[calc(100vh-12rem)]">
                {processing ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                      <p className="mt-4 text-sm text-muted-foreground">AI 处理中...</p>
                    </div>
                  </div>
                ) : result ? (
                  <div className="space-y-4">
                    <Card className="p-4">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{result}</p>
                    </Card>
                    <div className="flex gap-2">
                      <Button onClick={applyResult} className="flex-1">
                        应用结果
                      </Button>
                      <Button variant="outline" onClick={() => setResult("")}>
                        清除
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12 text-center text-sm text-muted-foreground">
                    <div>
                      <MessageSquare className="mx-auto h-12 w-12 opacity-20" />
                      <p className="mt-4">选择文本并使用 AI 工具</p>
                      <p className="mt-1">处理结果将显示在这里</p>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
