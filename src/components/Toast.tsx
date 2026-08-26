export function Toast({ message }: { message: string }) {
  return (
    <div className="fixed top-3.5 left-1/2 -translate-x-1/2 bg-bg-elev-2 text-text px-[18px] py-[11px] rounded-2xl font-sans text-[13px] font-semibold z-[60] border border-border shadow-[0_4px_20px_rgba(0,0,0,0.4)] max-w-[88%] w-max whitespace-normal leading-normal text-center">
      {message}
    </div>
  );
}
