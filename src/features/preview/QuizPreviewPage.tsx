import { PokemonCard } from "@/components/pokemon/PokemonCard";
import { PokemonStats } from "@/components/pokemon/PokemonStats";
import { EvolutionContent } from "@/components/pokemon/EvolutionContent";
import { GraduationContent } from "@/components/pokemon/GraduationContent";
import { PokedexGrid } from "@/components/pokedex/PokedexGrid";
import { QuizCard } from "@/components/quiz/QuizCard";
import { WrongAnswerPanel } from "@/components/quiz/WrongAnswerPanel";
import { findSpeciesById, getAllSpecies } from "@/content/pokemon";
import { pickGraduationCandidates } from "@/core/candidatePicker";
import type {
  Question,
  YesNoQuestion as YesNoQ,
  MultipleChoiceQuestion as MCQ,
  FillBlankQuestion as FBQ,
} from "@/content/questions/types";

const allSpecies = getAllSpecies();
const sampleSpecies = findSpeciesById("charmander") ?? allSpecies[0];
const evolutionNext = findSpeciesById("charmeleon") ?? allSpecies[0];
const graduatedSample = findSpeciesById("charizard") ?? allSpecies[0];
// 실제 candidatePicker 호출로 정합 보장 (1차 진화체만 + 도감 미등록만 + 전설 제외)
const graduationCandidates = pickGraduationCandidates({
  unlockedSpeciesIds: ["charmander", "charmeleon", "charizard"],
  graduatedSpeciesIds: ["charizard"],
  legendaryStage: "none",
  allSpecies,
});
const sampleStats = { hp: 42, attack: 57, defense: 33, speed: 61 };

const yesNoSample: YesNoQ = {
  questionId: "preview-yn",
  type: "yes_no",
  prompt: "화살표 함수는 자신만의 this를 가진다.",
  answer: false,
  acceptedAnswers: ["아니오", "false"],
  conceptGroup: "this-core",
  explanation: "화살표 함수는 자신만의 this를 가지지 않고 외부 렉시컬 환경의 this를 사용한다.",
  sourceExcerptId: "preview-001",
};

const mcSample: MCQ = {
  questionId: "preview-mc",
  type: "multiple_choice",
  prompt: "메서드 안의 this는 보통 무엇을 가리키나?",
  answer: "점 앞의 객체",
  choices: ["전역 객체", "점 앞의 객체", "항상 undefined", "항상 함수 자신", "새로 생성된 빈 객체"],
  conceptGroup: "this-core",
  explanation: "메서드 호출에서 this는 점 앞의 객체를 가리킨다.",
  sourceExcerptId: "preview-002",
};

const fbSample: FBQ = {
  questionId: "preview-fb",
  type: "fill_blank",
  prompt: "obj.method() 호출 시, method 안의 this는 ____ 를 가리킨다.",
  answer: "obj",
  acceptedAnswers: ["obj", "점 앞의 객체"],
  conceptGroup: "this-core",
  explanation: "메서드를 호출할 때 this는 점(.) 앞의 객체를 참조한다.",
  sourceExcerptId: "preview-003",
};

const noop = () => {};

interface SectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}

function Section({ id, title, children, wide }: SectionProps) {
  return (
    <section
      id={id}
      data-screenshot
      className={`w-full ${wide ? "max-w-3xl" : "max-w-lg"} flex flex-col gap-3`}
    >
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</h2>
      {children}
    </section>
  );
}

export default function QuizPreviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center gap-10 p-8">
      <h1 className="text-2xl font-bold">학습 화면 UI 프리뷰</h1>

      <Section id="preview-layout" title="학습 화면 전체 레이아웃">
        <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white border border-gray-200">
          <PokemonCard species={sampleSpecies} />
          <PokemonStats stats={sampleStats} />
          <p className="text-sm text-gray-500">
            연속 정답 <span className="font-bold text-blue-600">3</span>개
          </p>
          <div className="w-full">
            <QuizCard question={mcSample as Question} onSubmit={noop} disabled={false} />
          </div>
        </div>
      </Section>

      <Section id="preview-yesno" title="예/아니오 문제">
        <QuizCard question={yesNoSample as Question} onSubmit={noop} disabled={false} />
      </Section>

      <Section id="preview-fillblank" title="주관식 문제">
        <QuizCard question={fbSample as Question} onSubmit={noop} disabled={false} />
      </Section>

      <Section id="preview-wrong" title="오답 패널">
        <div className="flex flex-col gap-4">
          <QuizCard question={yesNoSample as Question} onSubmit={noop} disabled={true} />
          <WrongAnswerPanel
            question={yesNoSample as Question}
            sourceUrl="https://ko.javascript.info/object-methods"
            onNext={noop}
          />
        </div>
      </Section>

      <Section id="preview-evolution" title="진화 모달">
        <div className="rounded-2xl bg-white shadow-xl border border-gray-200">
          <EvolutionContent
            currentSpecies={sampleSpecies}
            nextSpecies={evolutionNext}
            submitting={false}
            onEvolve={noop}
            onSkip={noop}
          />
        </div>
      </Section>

      <Section id="preview-graduation" title="졸업 모달">
        <div className="rounded-2xl bg-white shadow-xl border border-gray-200">
          <GraduationContent
            graduatedSpecies={graduatedSample}
            candidates={graduationCandidates}
            submitting={false}
            selectedSpeciesId={null}
            onSelect={noop}
          />
        </div>
      </Section>

      <Section id="preview-pokedex" title="도감 화면" wide>
        <div className="flex flex-col gap-3 p-6 bg-white rounded-2xl border border-gray-200">
          <h3 className="text-xl font-bold">포켓몬 도감</h3>
          <div className="flex flex-wrap justify-between items-center gap-2 text-sm text-gray-600">
            <span className="tabular-nums">3 / 151 · 1%</span>
            <span>일반 도감을 완성하면 전설이 해금돼요.</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-400" style={{ width: "2%" }} />
          </div>
          <div className="max-h-[320px] overflow-hidden">
            <PokedexGrid unlockedSpeciesIds={["bulbasaur", "charmander", "ivysaur"]} />
          </div>
        </div>
      </Section>
    </div>
  );
}
