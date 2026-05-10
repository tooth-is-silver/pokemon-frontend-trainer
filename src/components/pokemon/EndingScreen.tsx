import { Link } from "react-router-dom";

// Phase E 임시 엔딩 화면. Phase G 에서 도감 100% + 졸업 명단까지 본격 구성.
export function EndingScreen() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-yellow-50 to-blue-50 p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ending-title"
    >
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <h1 id="ending-title" className="text-3xl font-bold text-blue-800">
          엔딩
        </h1>
        <p className="leading-relaxed text-gray-700">
          모든 포켓몬을 졸업시키고 도감을 완성했어요. 함께해 주셔서 고마워요!
        </p>
        <Link
          to="/pokedex"
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
        >
          도감 보러 가기
        </Link>
      </div>
    </div>
  );
}
