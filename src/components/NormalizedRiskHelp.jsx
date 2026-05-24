import { HelpCircle } from "lucide-react";

export default function NormalizedRiskHelp() {
  return (
    <div className="relative group">
      <button className="flex items-center justify-center w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">
        <HelpCircle className="w-4.5 h-4.5" />
      </button>
      <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute top-full right-0 mt-2 w-72 bg-slate-800 text-white text-xs rounded-xl p-4 z-50 pointer-events-none shadow-xl">
        <p className="font-semibold text-sm mb-2">Sobre o risco normalizado</p>
        <p className="text-slate-300 leading-relaxed">
          A probabilidade bruta varia por especialidade, o modelo aprende um
          limiar de decisão diferente para cada grupo. Para permitir comparação
          direta, a probabilidade é ajustada de forma que o limiar da
          especialidade sempre corresponda a 50%:
        </p>
        <ul className="mt-2 text-slate-300 space-y-0.5 list-none">
          <li>• Abaixo do limiar → mapeado para 0–50%</li>
          <li>• Acima do limiar → mapeado para 50–100%</li>
        </ul>
        <p className="mt-2 text-slate-300 leading-relaxed">
          Assim, qualquer valor acima de 50% indica risco de falta,
          independentemente da especialidade.
        </p>
        <p className="mt-2 text-slate-300 leading-relaxed">
          Passe o cursor sobre o tooltip de cada consulta para ver o limiar e a
          probabilidade bruta originais da predição.
        </p>
      </div>
    </div>
  );
}
