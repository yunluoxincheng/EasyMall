"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { AccountShell } from "@/components/layout/account-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { useMyComments, useDeleteMyComment } from "@/lib/hooks";
import { formatDateTime } from "@/lib/format";

export default function UserCommentsPage() {
  const [page, setPage] = useState(1);
  const { data: commentPage } = useMyComments({ pageNum: page, pageSize: 8 });
  const deleteComment = useDeleteMyComment();

  const comments = commentPage?.records ?? [];
  const total = commentPage?.total ?? 0;

  async function handleDelete(id: number) {
    if (!window.confirm("确定删除这条评论吗？")) return;
    try {
      await deleteComment.mutateAsync(id);
      toast.success("评论已删除");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "删除评论失败");
    }
  }

  return (
    <AccountShell
      title="我的评论"
      description="保留评论历史、评分和商家回复展示，同时允许用户删除自己的评论记录。"
    >
      {comments.length ? (
        <>
          <div className="space-y-5">
            {comments.map((comment) => (
              <Card key={comment.id} className="rounded-[30px]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="font-black text-slate-950">
                    商品 ID：{comment.productId}
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${index < comment.rating ? "fill-current" : ""}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{comment.content}</p>
                {comment.images ? (
                  <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-5">
                    {comment.images.split(",").map((image, index) => (
                      <div key={`${comment.id}-${index}`} className="aspect-square overflow-hidden rounded-[18px] bg-slate-100">
                        <img alt={`comment-${index}`} className="h-full w-full object-cover" src={image} />
                      </div>
                    ))}
                  </div>
                ) : null}
                {comment.reply ? (
                  <div className="mt-4 rounded-[24px] bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                    <span className="font-semibold text-slate-900">商家回复：</span>
                    {comment.reply}
                  </div>
                ) : null}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm text-slate-400">{formatDateTime(comment.createTime)}</span>
                  <Button variant="secondary" onClick={() => void handleDelete(comment.id)}>
                    删除评论
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-6">
            <Pagination page={page} pageSize={8} total={total} onPageChange={setPage} />
          </div>
        </>
      ) : (
        <EmptyState
          title="暂无评论记录"
          description="确认收货后的订单仍会保留评论入口，后续可以继续增强成完整评价工作流。"
        />
      )}
    </AccountShell>
  );
}
