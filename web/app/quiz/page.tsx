import type { Metadata } from "next";
import SmartQuizV2 from "../../components/smart-quiz/SmartQuizV2";
export const metadata: Metadata = { title: "Smart Quiz | ProteínaSmart", description: "Una orientación inicial según tu objetivo, entrenamiento y presupuesto.", alternates: { canonical: "/quiz" } };
export default function QuizPage() { return <SmartQuizV2 />; }
