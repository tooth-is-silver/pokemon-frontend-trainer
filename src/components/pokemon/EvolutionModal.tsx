import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import type { PokemonSpecies } from "@/content/pokemon/types";
import { EvolutionContent } from "./EvolutionContent";

interface Props {
  open: boolean;
  currentSpecies: PokemonSpecies;
  nextSpecies: PokemonSpecies;
  onEvolve: () => Promise<void>;
  onSkip: () => Promise<void>;
}

export function EvolutionModal({ open, currentSpecies, nextSpecies, onEvolve, onSkip }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const run = async (action: () => Promise<void>) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await action();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl w-[90vw] max-w-md z-50 focus:outline-none"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <Dialog.Title className="sr-only">진화 확인</Dialog.Title>
          <Dialog.Description className="sr-only">
            포켓몬이 진화할 수 있어요. 진화할지 보류할지 선택하세요.
          </Dialog.Description>
          <EvolutionContent
            currentSpecies={currentSpecies}
            nextSpecies={nextSpecies}
            submitting={submitting}
            onEvolve={() => run(onEvolve)}
            onSkip={() => run(onSkip)}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
