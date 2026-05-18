"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AccountShell } from "@/components/layout/account-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { useDeleteMyComment, useMyComments } from "@/lib/hooks";
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
    <AccountShell title="我的评论" description="这里汇总你在商城内留下的商品评价与商家回复。">
      {comments.length ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="store-section p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-semibold text-ink">商品 ID：{comment.productId}</div>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className={`h-4 w-4 ${index < comment.rating ? "fill-current" : ""}`} />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted">{comment.content}</p>
              {comment.images ? (
                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {comment.images.split(",").map((image, index) => (
                    <div key={`${comment.id}-${index}`} className="relative aspect-square overflow-hidden rounded-[18px] bg-[#f6f7fb]">
                      <Image alt={`comment-${index}`} className="h-full w-full object-cover" fill sizes="120px" src={image} />
                    </div>
                  ))}
                </div>
              ) : null}
              {comment.reply ? (
                <div className="mt-4 rounded-[20px] bg-[#f6f7fb] px-4 py-3 text-sm text-muted">
                  <span className="font-semibold text-ink">商家回复：</span>
                  {comment.reply}
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-muted">{formatDateTime(comment.createTime)}</span>
                <Button className="rounded-full px-5" variant="secondary" onClick={() => void handleDelete(comment.id)}>
                  删除评论
                </Button>
              </div>
            </div>
          ))}
          <Pagination page={page} pageSize={8} total={total} onPageChange={setPage} />
        </div>
      ) : (
        <EmptyState title="暂无评论记录" description="确认收货后可以对商品进行评价。" />
      )}
    </AccountShell>
  );
}
