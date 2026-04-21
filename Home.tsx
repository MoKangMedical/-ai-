import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Languages,
  Sparkles,
  CheckCircle2,
  Clock,
  Globe,
  AlignLeft,
  PenLine,
  FileText,
  Loader2,
} from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  const features = [
    {
      icon: Languages,
      title: "学科翻译",
      description: "专业的中英互译，保持学术规范和准确性",
    },
    {
      icon: Sparkles,
      title: "学科润色",
      description: "优化语言表达，提升文本的专业性和地道性",
    },
    {
      icon: CheckCircle2,
      title: "语法校对",
      description: "自动检测并修正语法错误、拼写问题",
    },
    {
      icon: Clock,
      title: "时态校正",
      description: "确保时态使用符合学术写作规范",
    },
    {
      icon: Globe,
      title: "英式美式转换",
      description: "在英式英语和美式英语之间自由切换",
    },
    {
      icon: AlignLeft,
      title: "句式优化",
      description: "改善句式结构，增强逻辑连贯性",
    },
    {
      icon: FileText,
      title: "段落优化",
      description: "优化段落结构，确保主题明确、组织合理",
    },
    {
      icon: PenLine,
      title: "智能续写",
      description: "基于上下文智能生成符合学术规范的内容",
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#1a0f2e] via-[#2d1b4e] to-[#3d2b5e]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0f2e] via-[#2d1b4e] to-[#3d2b5e]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">学术写作助手</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                  onClick={() => navigate("/documents")}
                >
                  我的文档
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                  onClick={() => navigate("/pricing")}
                >
                  会员价格
                </Button>
                <Button
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  onClick={() => navigate("/editor")}
                >
                  开始写作
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                  onClick={() => navigate("/pricing")}
                >
                  会员价格
                </Button>
                <Button
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  onClick={() => (window.location.href = getLoginUrl())}
                >
                  登录
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-5xl font-bold leading-tight text-white">
            让学术写作
            <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              更专业、更高效
            </span>
          </h1>
          <p className="mb-8 text-xl text-white/80">
            基于 Kimi 2.5 大模型的智能学术写作平台
            <br />
            提供翻译、润色、语法校对、智能续写等全方位写作支持
          </p>
          {user ? (
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                onClick={() => navigate("/editor")}
              >
                <PenLine className="mr-2 h-5 w-5" />
                开始写作
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                onClick={() => navigate("/documents")}
              >
                <FileText className="mr-2 h-5 w-5" />
                我的文档
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              免费开始使用
            </Button>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">强大的 AI 功能</h2>
          <p className="text-white/70">全方位的学术写作辅助工具，让您的论文更出色</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="group border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:shadow-2xl hover:shadow-primary/30"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="text-sm text-white/60">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 text-center">
        <Card className="mx-auto max-w-3xl border-white/10 bg-gradient-to-br from-primary/20 to-accent/20 p-12 shadow-2xl shadow-primary/20 backdrop-blur-md">
          <h2 className="mb-4 text-3xl font-bold text-white">准备好开始了吗？</h2>
          <p className="mb-8 text-lg text-white/70">
            立即体验 AI 驱动的学术写作助手，提升您的写作效率和质量
          </p>
          {user ? (
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              onClick={() => navigate("/editor")}
            >
              <PenLine className="mr-2 h-5 w-5" />
              开始写作
            </Button>
          ) : (
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              免费注册
            </Button>
          )}
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container text-center text-sm text-white/50">
          <p>© 2026 学术写作助手. Powered by Kimi 2.5</p>
        </div>
      </footer>
    </div>
  );
}
