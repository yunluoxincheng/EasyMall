"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { CommentPageItem } from "@/lib/types";

export default function AdminCommentPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [productId, setProductId] = useState("");
  const [userId, setUserId] = useState("");
  const [items, setItems] = useState<CommentPageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [replyTarget, setReplyTarget] = useState<CommentPageItem | null>(null);
  const [reply, setReply] = useState("");

  useEffect(() => {
    void loadData();
  }, [page, productId, status, userId]);

  async function loadData() {
    try {
      const pageData = await adminApi.getComments({
        pageNum: page,
        pageSize: 10,
        showStatus: status ? Number(status) : undefined,
        productId: productId ? Number(productId) : undefined,
        userId: userId ? Number(userId) : undefined,
      });
      setItems(pageData.records);
      setTotal(pageData.total);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "获取评论列表失败");
    }
  }

  async function handleApprove(id: number) {
    try {
      await adminApi.approveComment(id);
      toast.success("评论已通过");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "审核失败");
    }
  }

  async function handleReject(id: number) {
    try {
      await adminApi.rejectComment(id);
      toast.success("评论已拒绝");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "拒绝失败");
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("确定删除这条评论吗？")) {
      return;
    }
    try {
      await adminApi.deleteComment(id);
      toast.success("评论已删除");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "删除评论失败");
    }
  }

  async function handleReply() {
    if (!replyTarget || !reply.trim()) {
      toast.warning("请先输入回复内容");
      return;
    }
    try {
      await adminApi.replyComment(replyTarget.id, reply.trim());
      toast.success("回复成功");
      setReplyTarget(null);
      setReply("");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "回复失败");
    }
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[30px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Comments
            </p>
            <h2 className="mt-3 text-2xl font-black">评论审核</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-[150px_150px_150px]">
            <Select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">全部状态</option>
              <option value="0">待审核</option>
              <option value="1">已通过</option>
            </Select>
            <Input placeholder="商品 ID" value={productId} onChange={(event) => setProductId(event.target.value)} />
            <Input placeholder="用户 ID" value={userId} onChange={(event) => setUserId(event.target.value)} />
          </div>
        </div>
      </Card>

      <Card className="rounded-[30px] overflow-x-auto">
        <table className="admin-table min-w-[1100px]">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户</th>
              <th>商品</th>
              <th>内容</th>
              <th>评分</th>
              <th>状态</th>
              <th>回复</th>
              <th>时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.nickname || item.username}</td>
                <td>{item.productName}</td>
                <td className="max-w-[260px]">{item.content}</td>
                <td>{item.rating}</td>
                <td>
                  <Badge tone={item.showStatus === 1 ? "success" : "warning"}>
                    {item.showStatus === 1 ? "已通过" : "待审核"}
                  </Badge>
                </td>
                <td>{item.reply || "-"}</td>
                <td>{formatDateTime(item.createTime)}</td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    {item.showStatus === 1 ? (
                      <Button variant="ghost" onClick={() => void handleReject(item.id)}>
                        拒绝
                      </Button>
                    ) : (
                      <Button variant="ghost" onClick={() => void handleApprove(item.id)}>
                        通过
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setReplyTarget(item);
                        setReply(item.reply || "");
                      }}
                    >
                      回复
                    </Button>
                    <Button variant="danger" onClick={() => void handleDelete(item.id)}>
                      删除
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Pagination page={page} pageSize={10} total={total} onPageChange={setPage} />

      <Modal
        description="后台保留审核状态、商品与用户上下文，并支持商家回复。"
        onClose={() => setReplyTarget(null)}
        open={Boolean(replyTarget)}
        title={replyTarget ? `回复评论 · ${replyTarget.productName}` : "回复评论"}
      >
        <div className="rounded-[24px] bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          原评论：{replyTarget?.content}
        </div>
        <div className="mt-4">
          <label className="field-label">回复内容</label>
          <Textarea value={reply} onChange={(event) => setReply(event.target.value)} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setReplyTarget(null)}>
            取消
          </Button>
          <Button onClick={() => void handleReply()}>提交回复</Button>
        </div>
      </Modal>
    </div>
  );
}
