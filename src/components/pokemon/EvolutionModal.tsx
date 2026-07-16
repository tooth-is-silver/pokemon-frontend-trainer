import * as Dialog from "@radix-ui/react-dialog";
import { useRef, useState } from "react";
import type { PokemonSpecies } from "@/content/pokemon/types";
import { EvolutionContent } from "./EvolutionContent";

interface Props {
  open: boolean;
  currentSpecies: PokemonSpecies;
  nextSpecies: PokemonSpecies;
  onEvolve: () => Promise<void>;
}

export function EvolutionModal({ open, currentSpecies, nextSpecies, onEvolve }: Props) {
  const submittingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);

  // 연타 방지: state는 리렌더 전이라 stale할 수 있어 ref로 동기 guard
  const run = async (action: () => Promise<void>) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await action();
    } catch (error) {
      console.error("진화 처리 실패:", error);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl w-[90vw] max-w-md z-50 focus:outline-none"
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <Dialog.Title className="sr-only">진화 확인</Dialog.Title>
          <Dialog.Description className="sr-only">
            포켓몬이 진화할 수 있어요. 진화하면 새 포켓몬이 도감에 등록됩니다.
          </Dialog.Description>
          <EvolutionContent
            currentSpecies={currentSpecies}
            nextSpecies={nextSpecies}
            submitting={submitting}
            onEvolve={() => run(onEvolve)}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
