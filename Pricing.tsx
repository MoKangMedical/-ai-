import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Crown, Sparkles, Star, Zap, Loader2, ArrowLeft } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Pricing() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  const plans = [
    {
      name: "基础版",
      icon: Sparkles,
      price: "¥99",
      period: "/月",
      description: "适合个人学术写作需求",
      gradient: "from-yellow-400 to-orange-400",
      bgGradient: "from-yellow-500/20 to-orange-500/20",
      features: [
        "学科翻译（中英互译）",
        "学科润色",
        "语法校对",
        "时态校正",
        "10,000 字/月",
        "基础客服支持",
        "文档云存储 1GB",
      ],
    },
    {
      name: "专业版",
      icon: Crown,
      price: "¥299",
      period: "/月",
      description: "适合高频写作用户",
      gradient: "from-purple-400 to-pink-400",
      bgGradient: "from-purple-500/20 to-pink-500/20",
      popular: true,
      features: [
        "✓ 基础版所有功能",
        "英式美式英语转换",
        "句式结构优化",
        "逻辑连贯性增强",
        "段落结构优化",
        "50,000 字/月",
        "优先客服支持",
        "文档云存储 10GB",
        "AI 处理历史记录",
      ],
    },
    {
      name: "旗舰版",
      icon: Star,
      price: "¥599",
      period: "/月",
      description: "适合专业科研团队",
      gradient: "from-blue-400 to-cyan-400",
      bgGradient: "from-blue-500/20 to-cyan-500/20",
      features: [
        "✓ 专业版所有功能",
        "智能续写",
        "无限字数",
        "专属客服支持",
        "文档云存储 100GB",
        "团队协作功能",
        "API 接口访问",
        "定制化 AI 模型",
        "专属 VIP 标识",
      ],
    },
  ];

  const comparisonFeatures = [
    {
      category: "核心功能",
      items: [
        { name: "学科翻译", basic: true, pro: true, premium: true },
        { name: "学科润色", basic: true, pro: true, premium: true },
        { name: "语法校对", basic: true, pro: true, premium: true },
        { name: "时态校正", basic: true, pro: true, premium: true },
        { name: "英式美式转换", basic: false, pro: true, premium: true },
        { name: "句式结构优化", basic: false, pro: true, premium: true },
        { name: "逻辑连贯性增强", basic: false, pro: true, premium: true },
        { name: "段落结构优化", basic: false, pro: true, premium: true },
        { name: "智能续写", basic: false, pro: false, premium: true },
      ],
    },
    {
      category: "使用限额",
      items: [
        { name: "月度字数", basic: "10,000", pro: "50,000", premium: "无限" },
        { name: "文档存储", basic: "1GB", pro: "10GB", premium: "100GB" },
        { name: "AI 历史记录", basic: "7天", pro: "30天", premium: "永久" },
      ],
    },
    {
      category: "增值服务",
      items: [
        { name: "客服支持", basic: "基础", pro: "优先", premium: "专属" },
        { name: "团队协作", basic: false, pro: false, premium: true },
        { name: "API 访问", basic: false, pro: false, premium: true },
        { name: "定制模型", basic: false, pro: false, premium: true },
        { name: "VIP 标识", basic: false, pro: false, premium: true },
      ],
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
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="text-xl font-bold text-white">会员价格</span>
          </div>
          {user && (
            <Button
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              onClick={() => navigate("/editor")}
            >
              开始写作
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-16 text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">选择适合您的方案</h1>
        <p className="text-xl text-white/70">灵活的定价，强大的功能，助力您的学术写作</p>
      </section>

      {/* Pricing Cards */}
      <section className="container pb-20">
        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <Card
                key={index}
                className={`relative overflow-hidden border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-2xl ${
                  plan.popular ? "ring-2 ring-primary" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-xs font-bold text-white">
                    最受欢迎
                  </div>
                )}
                <div
                  className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${plan.bgGradient}`}
                >
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-white">{plan.name}</h3>
                <p className="mb-6 text-sm text-white/60">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/60">{plan.period}</span>
                </div>
                <Button
                  className={`mb-8 w-full bg-gradient-to-r ${plan.gradient} hover:opacity-90`}
                  onClick={() => {
                    if (user) {
                      // TODO: 实现购买逻辑
                      alert("购买功能开发中");
                    } else {
                      window.location.href = getLoginUrl();
                    }
                  }}
                >
                  {user ? "立即订阅" : "登录后订阅"}
                </Button>
                <ul className="space-y-3">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                      <span className="text-sm text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="container pb-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">功能对比</h2>
          <p className="text-white/70">详细了解各版本的功能差异</p>
        </div>
        <Card className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-4 text-left text-white">功能</th>
                  <th className="p-4 text-center text-white">基础版</th>
                  <th className="p-4 text-center text-white">专业版</th>
                  <th className="p-4 text-center text-white">旗舰版</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((category, cIndex) => (
                  <>
                    <tr key={`cat-${cIndex}`} className="border-b border-white/10 bg-white/5">
                      <td colSpan={4} className="p-4 font-semibold text-white">
                        {category.category}
                      </td>
                    </tr>
                    {category.items.map((item, iIndex) => (
                      <tr key={`item-${cIndex}-${iIndex}`} className="border-b border-white/5">
                        <td className="p-4 text-white/80">{item.name}</td>
                        <td className="p-4 text-center">
                          {typeof item.basic === "boolean" ? (
                            item.basic ? (
                              <Check className="mx-auto h-5 w-5 text-green-400" />
                            ) : (
                              <span className="text-white/30">—</span>
                            )
                          ) : (
                            <span className="text-white/70">{item.basic}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof item.pro === "boolean" ? (
                            item.pro ? (
                              <Check className="mx-auto h-5 w-5 text-green-400" />
                            ) : (
                              <span className="text-white/30">—</span>
                            )
                          ) : (
                            <span className="text-white/70">{item.pro}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof item.premium === "boolean" ? (
                            item.premium ? (
                              <Check className="mx-auto h-5 w-5 text-green-400" />
                            ) : (
                              <span className="text-white/30">—</span>
                            )
                          ) : (
                            <span className="text-white/70">{item.premium}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* FAQ Section */}
      <section className="container pb-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">常见问题</h2>
        </div>
        <div className="mx-auto max-w-3xl space-y-4">
          {[
            {
              q: "如何升级或降级我的订阅？",
              a: "您可以随时在账户设置中更改订阅计划。升级立即生效，降级将在当前周期结束后生效。",
            },
            {
              q: "是否支持退款？",
              a: "我们提供7天无理由退款保证。如果您对服务不满意，可以在购买后7天内申请全额退款。",
            },
            {
              q: "字数限制如何计算？",
              a: "字数限制按照输入到 AI 处理的文本字符数计算，包括中英文字符。每月1日自动重置。",
            },
            {
              q: "是否支持团队使用？",
              a: "旗舰版支持团队协作功能，可以添加多个成员共享账户权限和存储空间。",
            },
          ].map((faq, index) => (
            <Card
              key={index}
              className="border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              <h3 className="mb-2 font-semibold text-white">{faq.q}</h3>
              <p className="text-sm text-white/70">{faq.a}</p>
            </Card>
          ))}
        </div>
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
