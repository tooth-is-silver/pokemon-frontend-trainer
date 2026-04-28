import * as Dialog from "@radix-ui/react-dialog";
import { useRef, useState } from "react";
import type { PokemonSpecies } from "@/content/pokemon/types";
import { GraduationContent } from "./GraduationContent";

interface Props {
  open: boolean;
  graduatedSpecies: PokemonSpecies;
  candidates: PokemonSpecies[];
  onSelect: (speciesId: string) => Promise<void>;
}

export function GraduationModal({ open, graduatedSpecies, candidates, onSelect }: Props) {
  const submittingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = async (speciesId: string) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSelectedId(speciesId);
    try {
      await onSelect(speciesId);
    } catch (error) {
      console.error("졸업 후 선택 실패:", error);
      setSelectedId(null);
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
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <Dialog.Title className="sr-only">졸업 후 다음 포켓몬 선택</Dialog.Title>
          <Dialog.Description className="sr-only">
            졸업한 포켓몬을 축하하고 다음으로 함께할 포켓몬을 선택하세요.
          </Dialog.Description>
          <GraduationContent
            graduatedSpecies={graduatedSpecies}
            candidates={candidates}
            submitting={submitting}
            selectedSpeciesId={selectedId}
            onSelect={handleSelect}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
