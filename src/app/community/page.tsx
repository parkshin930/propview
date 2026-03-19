"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WithdrawalVerificationCard } from "@/components/community/WithdrawalVerificationCard";
import { GenericPostCard } from "@/components/community/GenericPostCard";
import { CreatePostModal } from "@/components/community/CreatePostModal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import type { Post, PostCategory } from "@/types/database";
import { POST_CATEGORIES } from "@/types/database";
import { isAdmin } from "@/lib/admin";
import { REWARD_WITHDRAWAL_APPROVED_POINTS, REWARD_WITHDRAWAL_APPROVED_CREDITS } from "@/lib/rewards";
import { PenSquare, TrendingUp, Clock, Filter } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";

const COMMUNITY_PAGE_SIZE = 15;

function CommunityPageContent() {
  const searchParams = useSearchParams();
  const { user, profile, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const admin = isAdmin(user, profile);
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPostCount, setTotalPostCount] = useState(0);
  const [approvedProfitCount, setApprovedProfitCount] = useState(0);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | "all">("all");
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const supabase = createClient();
  const totalPages = Math.max(1, Math.ceil(filteredTotal / COMMUNITY_PAGE_SIZE));

  // 총 게시글 수(전체)·수익 인증 수(승인된 것만) 연동
  const fetchCounts = async () => {
    try {
      const [totalRes, approvedRes] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact", head: true }),
        supabase.from("posts").select("id", { count: "exact", head: true }).eq("category", "profit").eq("approval_status", "approved"),
      ]);
      setTotalPostCount(totalRes.count ?? 0);
      setApprovedProfitCount(approvedRes.count ?? 0);
    } catch (e) {
      console.error("카운트 조회 실패:", e);
    }
  };

  // URL 쿼리 category=profit 이면 출금 인증 탭 선택 (홈에서 '출금 인증' 클릭 시)
  useEffect(() => {
    const category = searchParams.get("category");
    if (category === "profit") {
      setSelectedCategory("profit");
    }
  }, [searchParams]);

  // 현재 필터 기준 전체 개수 (페이지네이션용)
  const fetchFilteredCount = async () => {
    let q = supabase.from("posts").select("id", { count: "exact", head: true });
    if (selectedCategory !== "all") q = q.eq("category", selectedCategory);
    const { count } = await q;
    setFilteredTotal(count ?? 0);
  };

  // 게시글 목록 가져오기 (서버 측 페이징)
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("posts")
        .select(`
          *,
          profiles (
            id,
            full_name,
            display_name,
            avatar_url,
            is_verified,
            role
          )
        `);

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      if (sortBy === "latest") {
        query = query.order("created_at", { ascending: false });
      } else {
        query = query.order("likes", { ascending: false });
      }

      const from = (page - 1) * COMMUNITY_PAGE_SIZE;
      const to = from + COMMUNITY_PAGE_SIZE - 1;
      const { data, error } = await query.range(from, to);

      if (error) {
        console.error("게시글 조회 에러:", error);
        return;
      }

      setPosts(data || []);
    } catch (error) {
      console.error("게시글 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredCount();
  }, [selectedCategory]);

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, sortBy, page]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    fetchCounts();
  }, []);

  const handlePostCreated = () => {
    setIsCreateModalOpen(false);
    setPage(1);
    fetchFilteredCount();
    fetchPosts();
    fetchCounts();
  };

  const handleApproveWithdrawal = async (post: Post) => {
    const { data: authorProfile } = await supabase
      .from("profiles")
      .select("points, credits, total_withdrawal_amount")
      .eq("id", post.user_id)
      .single();

    const currentPoints = (authorProfile?.points ?? 0) + REWARD_WITHDRAWAL_APPROVED_POINTS;
    const currentCredits = (authorProfile?.credits ?? 0) + REWARD_WITHDRAWAL_APPROVED_CREDITS;
    const addedAmount = Number(post.withdrawal_amount) || 0;
    const newTotalWithdrawal = (Number(authorProfile?.total_withdrawal_amount) || 0) + addedAmount;

    const { error: updatePostError } = await supabase
      .from("posts")
      .update({ approval_status: "approved" })
      .eq("id", post.id);
    if (updatePostError) {
      console.error("승인 반영 실패:", updatePostError);
      showToast("승인 처리에 실패했습니다.");
      return;
    }

    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({
        points: currentPoints,
        credits: currentCredits,
        is_verified: true,
        total_withdrawal_amount: newTotalWithdrawal,
      })
      .eq("id", post.user_id);

    if (updateProfileError) {
      console.error("프로필 업데이트 실패:", updateProfileError);
      showToast("승인은 반영되었으나 프로필 업데이트에 실패했습니다.");
    } else {
      showToast("승인되었습니다. 🔰 배지 및 포인트가 지급되었습니다.");
    }
    if (user?.id === post.user_id) await refreshProfile();
    fetchPosts();
    fetchCounts(); // 수익 인증 카운트 +1 반영
  };

  const profitPosts = posts.filter((p) => p.category === "profit");
  const profitApproved = profitPosts.filter((p) => p.approval_status === "approved" || p.approval_status == null);
  const profitPending = profitPosts.filter((p) => p.approval_status === "pending");
  const rankingPosts = selectedCategory === "profit" ? profitApproved : posts;
  const pendingPosts = selectedCategory === "profit" ? profitPending : [];

  // 수익 인증 카드용 메타 (DB 필드 우선, 없으면 예전 방식으로 추출)
  const getPropCompanyFromPost = (post: Post): string => {
    if (post.prop_company?.trim()) return post.prop_company;
    const match = post.content?.match(/PROP:\s*(\S+)/i) || post.title?.match(/(APEX|루시드|Lucid|트레이딩)/i);
    return match ? (match[1] || match[0]) : "—";
  };
  const getAmountFromPost = (post: Post): string => {
    if (post.withdrawal_amount != null) return `+ $${Number(post.withdrawal_amount).toLocaleString()}`;
    const match = post.content?.match(/AMOUNT:\s*\$?([\d,]+)/i) || post.content?.match(/\$\s*([\d,]+)/);
    if (match) return `+ $${Number(match[1]).toLocaleString()}`;
    return "+ $—";
  };
  const getVerificationImageUrl = (post: Post): string | null => post.verification_image_url ?? null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto max-w-screen-xl px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Community</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  수익 인증, 분석, 자유 토론을 나눠보세요
                </p>
              </div>

              {user ? (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-[#52c68f] hover:bg-[#45b07d] text-white gap-2"
                >
                  <PenSquare className="h-4 w-4" />
                  글쓰기
                </Button>
              ) : (
                <Button
                  asChild
                  variant="outline"
                  className="gap-2"
                >
                  <Link href="/auth">
                    <PenSquare className="h-4 w-4" />
                    로그인 후 글쓰기
                  </Link>
                </Button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-border">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="flex gap-1">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                    className={selectedCategory === "all" ? "bg-[#52c68f] hover:bg-[#45b07d]" : ""}
                  >
                    전체
                  </Button>
                  {POST_CATEGORIES.map((cat) => (
                    <Button
                      key={cat.value}
                      variant={selectedCategory === cat.value ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedCategory(cat.value)}
                      className={selectedCategory === cat.value ? "bg-[#52c68f] hover:bg-[#45b07d]" : ""}
                    >
                      {cat.value === "profit" ? "출금 인증" : cat.labelKo}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant={sortBy === "latest" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy("latest")}
                  className="gap-1"
                >
                  <Clock className="h-4 w-4" />
                  최신순
                </Button>
                <Button
                  variant={sortBy === "popular" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy("popular")}
                  className="gap-1"
                >
                  <TrendingUp className="h-4 w-4" />
                  인기순
                </Button>
              </div>
            </div>

            {/* Selected category total count */}
            <div className="mb-4 text-sm text-muted-foreground">
              {selectedCategory === "all" ? (
                <span>총 게시글 수: <span className="font-semibold text-foreground">{totalPostCount}</span>개</span>
              ) : (
                <span>
                  선택한 게시판 총 게시글 수:{" "}
                  <span className="font-semibold text-foreground">{filteredTotal}</span>개
                </span>
              )}
            </div>

            {/* Card Grid (출금 인증 시 카드형 그리드) */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-80 rounded-2xl border border-gray-100 bg-white shadow-md animate-pulse"
                  >
                    <div className="p-4">
                      <div className="h-5 w-16 rounded-full bg-gray-200" />
                      <div className="mt-2 h-8 w-28 rounded bg-gray-200" />
                    </div>
                    <div className="mx-4 aspect-[4/3] rounded-xl bg-gray-200" />
                    <div className="p-4">
                      <div className="h-4 w-full rounded bg-gray-200" />
                      <div className="mt-2 h-3 w-24 rounded bg-gray-200" />
                    </div>
                  </div>
                ))
              ) : rankingPosts.length === 0 && pendingPosts.length === 0 ? (
                <div className="col-span-full py-12 text-center">
                  <p className="text-muted-foreground">첫 번째 글을 남겨보세요!</p>
                  {user && (
                    <Button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="mt-4 bg-[#52c68f] hover:bg-[#45b07d]"
                    >
                      첫 글 작성하기
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {rankingPosts.map((post) =>
                    post.category === "profit" ? (
                      <WithdrawalVerificationCard
                        key={post.id}
                        post={post}
                        propCompany={getPropCompanyFromPost(post)}
                        amount={getAmountFromPost(post)}
                        imageUrl={getVerificationImageUrl(post)}
                        isAdmin={admin}
                        onApprove={handleApproveWithdrawal}
                      />
                    ) : (
                      <GenericPostCard key={post.id} post={post} />
                    )
                  )}
                  {pendingPosts.length > 0 && (
                    <>
                      <div className="col-span-full mt-6 pt-4 border-t border-border">
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3">승인 대기</h3>
                      </div>
                      {pendingPosts.map((post) => (
                        <WithdrawalVerificationCard
                          key={post.id}
                          post={post}
                          propCompany={getPropCompanyFromPost(post)}
                          amount={getAmountFromPost(post)}
                          imageUrl={getVerificationImageUrl(post)}
                          isAdmin={admin}
                          onApprove={handleApproveWithdrawal}
                        />
                      ))}
                    </>
                  )}
                </>
              )}
            </div>

            {!isLoading && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                light
              />
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 space-y-6">
            {/* Community Stats */}
            <div className="p-4 border border-border rounded-lg bg-card">
              <h3 className="font-semibold mb-4">커뮤니티 현황</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-[#52c68f]">{totalPostCount}</p>
                  <p className="text-xs text-muted-foreground">총 게시글</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-[#52c68f]">{approvedProfitCount}</p>
                  <p className="text-xs text-muted-foreground">수익 인증</p>
                </div>
              </div>
            </div>

            {/* Category Guide */}
            <div className="p-4 border border-border rounded-lg bg-card">
              <h3 className="font-semibold mb-4">카테고리 안내</h3>
              <div className="space-y-3">
                {POST_CATEGORIES.map((cat) => (
                  <div key={cat.value} className="flex items-start gap-2">
                    <span className="px-2 py-0.5 text-xs rounded bg-muted">
                      {cat.labelKo}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {cat.value === "profit" && "출금·수익 인증을 공유하세요"}
                      {cat.value === "free" && "자유롭게 대화하세요"}
                      {cat.value === "analysis" && "시장 분석을 공유하세요"}
                      {cat.value === "question" && "궁금한 점을 질문하세요"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="p-4 border border-border rounded-lg bg-card">
              <h3 className="font-semibold mb-4">커뮤니티 규칙</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 서로 존중하며 대화해주세요</li>
                <li>• 허위 수익 인증은 금지됩니다</li>
                <li>• 투자 권유 및 광고는 삭제됩니다</li>
                <li>• 개인정보 노출에 주의하세요</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <Footer />

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handlePostCreated}
      />
    </div>
  );
}

export default function CommunityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto max-w-screen-xl px-4 py-8 flex items-center justify-center">
          <p className="text-muted-foreground">로딩 중...</p>
        </main>
        <Footer />
      </div>
    }>
      <CommunityPageContent />
    </Suspense>
  );
}
