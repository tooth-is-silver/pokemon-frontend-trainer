import { PokemonCard } from "@/components/pokemon/PokemonCard";
import { PokemonExp } from "@/components/pokemon/PokemonExp";
import { EvolutionContent } from "@/components/pokemon/EvolutionContent";
import { GraduationContent } from "@/components/pokemon/GraduationContent";
import { PokedexGrid } from "@/components/pokedex/PokedexGrid";
import { CurrentPokemonCard } from "@/components/pokedex/CurrentPokemonCard";
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
import type { PokemonInstance } from "@/stores/types";

const allSpecies = getAllSpecies();
const sampleSpecies = findSpeciesById("charmander") ?? allSpecies[0];
const evolutionNext = findSpeciesById("charmeleon") ?? allSpecies[0];
const graduatedSample = findSpeciesById("charizard") ?? allSpecies[0];

function createStablePreviewRandom() {
  const values = [0.13, 0.47, 0.83];
  let index = 0;
  return () => values[index++ % values.length];
}

// 실제 candidatePicker 호출로 정합 보장 (1차 진화체만 + 도감 미등록만 + 전설 제외)
const graduationCandidates = pickGraduationCandidates({
  unlockedSpeciesIds: ["charmander", "charmeleon", "charizard"],
  graduatedSpeciesIds: ["charizard"],
  legendaryStage: "none",
  allSpecies,
  random: createStablePreviewRandom(),
});
const sampleExp = 61;

const currentInstanceMock: PokemonInstance = {
  instanceId: "mock-active",
  speciesId: "charmeleon",
  currentStage: 2,
  exp: 81,
  totalCorrectCount: 24,
  graduated: false,
  evolutionPending: false,
};
const currentSpeciesMock = findSpeciesById("charmeleon") ?? allSpecies[0];

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
    <section className={`flex w-full flex-col gap-3 ${wide ? "max-w-4xl" : "max-w-lg"}`}>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</h2>
      <div id={id} data-screenshot className="w-full">
        {children}
      </div>
    </section>
  );
}

interface PreviewAccountBarProps {
  active: "learn" | "pokedex";
}

function PreviewAccountBar({ active }: PreviewAccountBarProps) {
  return (
    <header className="border-b border-gray-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-500">로그인 중</p>
          <p className="truncate text-sm font-bold text-gray-950">trainer@example.com</p>
        </div>

        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          <span
            className={`rounded-full border px-3 py-2 ${
              active === "learn"
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-gray-200 text-gray-700"
            }`}
          >
            학습
          </span>
          <span
            className={`rounded-full border px-3 py-2 ${
              active === "pokedex"
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-gray-200 text-gray-700"
            }`}
          >
            도감
          </span>
          <span className="rounded-full border border-red-100 px-3 py-2 text-red-600">
            로그아웃
          </span>
        </nav>
      </div>
    </header>
  );
}

interface PagePreviewShellProps {
  active: "learn" | "pokedex";
  children: React.ReactNode;
}

function PagePreviewShell({ active, children }: PagePreviewShellProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 shadow-sm">
      <PreviewAccountBar active={active} />
      {children}
    </div>
  );
}

interface ModalPreviewShellProps {
  children: React.ReactNode;
}

function ModalPreviewShell({ children }: ModalPreviewShellProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 shadow-sm">
      <PreviewAccountBar active="learn" />
      <div className="relative min-h-[760px]">
        <div className="absolute inset-0 flex flex-col items-center gap-4 p-6 opacity-80">
          <PokemonCard species={sampleSpecies} />
          <PokemonExp exp={sampleExp} />
          <div className="w-full max-w-lg">
            <QuizCard question={mcSample as Question} onSubmit={noop} disabled={false} />
          </div>
        </div>
        <div className="relative z-10 flex min-h-[760px] items-center justify-center bg-black/50 p-6">
          <div className="w-[90vw] max-w-md rounded-2xl bg-white shadow-xl">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function QuizPreviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center gap-10 p-8">
      <h1 className="text-2xl font-bold">학습 화면 UI 프리뷰</h1>

      <Section id="preview-layout" title="학습 화면 전체 레이아웃">
        <PagePreviewShell active="learn">
          <div className="flex flex-col items-center gap-6 p-6">
            <section className="flex w-full max-w-lg flex-col items-center gap-4">
              <PokemonCard species={sampleSpecies} />
              <PokemonExp exp={sampleExp} />
              <p className="text-sm text-gray-500">
                연속 정답 <span className="font-bold text-blue-600">3</span>개
              </p>
            </section>

            <section className="flex w-full max-w-lg flex-col gap-4">
              <QuizCard question={mcSample as Question} onSubmit={noop} disabled={false} />
            </section>
          </div>
        </PagePreviewShell>
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
        <ModalPreviewShell>
          <EvolutionContent
            currentSpecies={sampleSpecies}
            nextSpecies={evolutionNext}
            submitting={false}
            onEvolve={noop}
          />
        </ModalPreviewShell>
      </Section>

      <Section id="preview-graduation" title="졸업 모달">
        <ModalPreviewShell>
          <GraduationContent
            graduatedSpecies={graduatedSample}
            graduatedExp={100}
            candidates={graduationCandidates}
            submitting={false}
            selectedSpeciesId={null}
            onSelect={noop}
          />
        </ModalPreviewShell>
      </Section>

      <Section id="preview-pokedex" title="도감 화면" wide>
        <PagePreviewShell active="pokedex">
          <div className="flex flex-col items-center gap-6 p-6">
            <header className="flex w-full max-w-4xl flex-col gap-3">
              <h3 className="text-2xl font-bold">포켓몬 도감</h3>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
                <span className="tabular-nums">5 / 151 · 3%</span>
                <span>일반 도감을 완성하면 전설이 해금돼요.</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full bg-blue-400" style={{ width: "3%" }} />
              </div>
            </header>

            <section className="w-full max-w-4xl">
              <CurrentPokemonCard
                instance={currentInstanceMock}
                species={currentSpeciesMock}
                graduationPending={true}
              />
            </section>

            <main className="max-h-[620px] w-full max-w-4xl overflow-hidden">
              <PokedexGrid
                unlockedSpeciesIds={[
                  "bulbasaur",
                  "ivysaur",
                  "venusaur",
                  "charmander",
                  "charmeleon",
                ]}
              />
            </main>
          </div>
        </PagePreviewShell>
      </Section>
    </div>
  );
}
