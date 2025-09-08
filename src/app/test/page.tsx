import FeatureCard from "@/components/FeatureCard";

export default function TestPage() {
  return (
    <div className="p-6">
      <FeatureCard
        feature={{
          id: "1",
          title: "Novo recurso",
          description: "Descrição de teste",
          status: "ativo",
          score: 5,
          companies: 3,
          votes: 12,
        }}
      />
    </div>
  );
}