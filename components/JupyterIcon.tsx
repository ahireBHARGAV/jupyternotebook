export default function JupyterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 8C73.196 8 92 26.804 92 50C92 73.196 73.196 92 50 92C26.804 92 8 73.196 8 50C8 26.804 26.804 8 50 8Z" fill="#F37626"/>
      <path d="M50 20C66.5685 20 80 33.4315 80 50C80 66.5685 66.5685 80 50 80C33.4315 80 20 66.5685 20 50C20 33.4315 33.4315 20 50 20Z" fill="white"/>
      <circle cx="28" cy="28" r="8" fill="#757575"/>
      <circle cx="72" cy="72" r="6" fill="#757575"/>
      <circle cx="82" cy="30" r="7" fill="#757575"/>
    </svg>
  );
}
