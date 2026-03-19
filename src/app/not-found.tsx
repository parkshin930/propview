import Link from "next/link";
import "./globals.css";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <h1 className="text-2xl font-semibold mb-2">404</h1>
      <p className="text-muted-foreground mb-6">페이지를 찾을 수 없습니다.</p>
      <Link
        href="/"
        className="text-primary hover:underline font-medium"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
