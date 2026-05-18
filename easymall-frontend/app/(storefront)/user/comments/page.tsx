"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { AccountShell } from "@/components/layout/account-shell";
import { Button } from "@/components/ui/button";
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
    <AccountShell title="我的评论" description="你的评论历史记录">
      {comments.length ? (
        <>
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="rounded-lg bg-white p-4 shadow-card">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-ink">商品 ID：{comment.productId}</div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className={`h-3.5 w-3.5 ${index < comment.rating ? "fill-current" : ""}`} />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">{comment.content}</p>
                {comment.images ? (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {comment.images.split(",").map((image, index) => (
                      <div key={`${comment.id}-${index}`} className="aspect-square overflow-hidden rounded-md bg-gray-50">
                        <img alt={`comment-${index}`} className="h-full w-full object-cover" src={image} />
                      </div>
                    ))}
                  </div>
                ) : null}
                {comment.reply ? (
                  <div className="mt-2 rounded-md bg-gray-50 p-3 text-sm text-muted">
                    <span className="font-medium text-ink">商家回复：</span>{comment.reply}
                  </div>
                ) : null}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted">{formatDateTime(comment.createTime)}</span>
                  <Button variant="secondary" className="text-xs h-7 px-2" onClick={() => void handleDelete(comment.id)}>删除</Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Pagination page={page} pageSize={8} total={total} onPageChange={setPage} />
          </div>
        </>
      ) : (
        <EmptyState title="暂无评论记录" description="确认收货后可以对商品进行评价" />
      )}
    </AccountShell>
  );
}
