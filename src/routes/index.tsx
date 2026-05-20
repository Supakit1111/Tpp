import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  ClipboardList,
  PlusCircle,
  Pencil,
  Trash2,
  CalendarDays,
  User,
  Inbox,
  X,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

type Ticket = {
  id: number;
  reported_at: string;
  reporter: string;
  description: string;
};

function Index() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [reportedAt, setReportedAt] = useState(
    new Date().toISOString().slice(0, 16),
  );
  const [reporter, setReporter] = useState("");
  const [description, setDescription] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/tickets");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setTickets(data);
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setEditingId(null);
    setReporter("");
    setDescription("");
    setReportedAt(new Date().toISOString().slice(0, 16));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporter.trim() || !description.trim()) {
      toast.error("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    const payload = {
      reporter: reporter.trim(),
      description: description.trim(),
      reported_at: new Date(reportedAt).toISOString(),
    };
    if (editingId) {
      try {
        const res = await fetch(`http://localhost:3000/api/tickets/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(await res.text());
        toast.success("แก้ไขข้อมูลสำเร็จ");
      } catch (error: any) {
        return toast.error(error.message);
      }
    } else {
      try {
        const res = await fetch("http://localhost:3000/api/tickets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(await res.text());
        toast.success("บันทึกใบแจ้งซ่อมสำเร็จ");
      } catch (error: any) {
        return toast.error(error.message);
      }
    }
    reset();
    load();
  };

  const onEdit = (t: Ticket) => {
    setEditingId(t.id);
    setReporter(t.reporter);
    setDescription(t.description);
    setReportedAt(new Date(t.reported_at).toISOString().slice(0, 16));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`http://localhost:3000/api/tickets/${deletingId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("ลบข้อมูลสำเร็จ");
      load();
    } catch (error: any) {
      toast.error(error.message);
    }
    setDeletingId(null);
  };

  const stats = useMemo(() => {
    const now = new Date();
    const today = tickets.filter(
      (t) => new Date(t.reported_at).toDateString() === now.toDateString(),
    ).length;
    const reporters = new Set(tickets.map((t) => t.reporter)).size;
    return { total: tickets.length, today, reporters };
  }, [tickets]);

  return (
    <div className="p-6 lg:p-8">
      <Toaster richColors />
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Hero header */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge className="mb-3 bg-gold text-gold-foreground hover:bg-gold/90">
                Repair Management
              </Badge>
              <h1 className="font-display text-3xl font-semibold tracking-tight">
                ระบบแจ้งซ่อมทั่วไป
              </h1>
              <p className="mt-2 max-w-lg text-sm text-primary-foreground/80">
                เปิดใบแจ้งซ่อม จัดการ และติดตามรายการซ่อมทั้งหมดจากที่เดียว
              </p>
            </div>
            <div className="hidden h-16 w-16 items-center justify-center rounded-2xl bg-gold/20 ring-1 ring-gold/40 md:flex">
              <ClipboardList className="h-8 w-8 text-gold" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="ใบแจ้งซ่อมทั้งหมด"
            value={stats.total}
            icon={<Inbox className="h-5 w-5" />}
          />
          <StatCard
            label="แจ้งวันนี้"
            value={stats.today}
            icon={<CalendarDays className="h-5 w-5" />}
          />
          <StatCard
            label="ผู้แจ้งทั้งหมด"
            value={stats.reporters}
            icon={<User className="h-5 w-5" />}
          />
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 font-display">
                  {editingId ? (
                    <Pencil className="h-5 w-5 text-gold" />
                  ) : (
                    <PlusCircle className="h-5 w-5 text-gold" />
                  )}
                  {editingId ? "แก้ไขใบแจ้งซ่อม" : "เปิดใบแจ้งซ่อมใหม่"}
                </CardTitle>
                <CardDescription>
                  กรอกรายละเอียดด้านล่างเพื่อบันทึกลงระบบ
                </CardDescription>
              </div>
              {editingId && (
                <Button variant="ghost" size="sm" onClick={reset}>
                  <X className="mr-1 h-4 w-4" />
                  ยกเลิก
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reported_at">วันที่แจ้งซ่อม</Label>
                <Input
                  id="reported_at"
                  type="datetime-local"
                  value={reportedAt}
                  onChange={(e) => setReportedAt(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reporter">ผู้แจ้ง</Label>
                <Input
                  id="reporter"
                  value={reporter}
                  onChange={(e) => setReporter(e.target.value)}
                  placeholder="ชื่อผู้แจ้ง"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">รายละเอียดงานที่ให้ทำ</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="อธิบายปัญหาหรืองานที่ต้องซ่อม..."
                  rows={4}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" size="lg" className="w-full md:w-auto">
                  {editingId ? "บันทึกการแก้ไข" : "บันทึกใบแจ้งซ่อม"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <ClipboardList className="h-5 w-5 text-gold" />
              รายการใบแจ้งซ่อมทั้งหมด
              <Badge variant="secondary" className="ml-1">
                {tickets.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              คลิกแก้ไขหรือลบในแต่ละรายการได้
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                กำลังโหลด...
              </p>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Inbox className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  ยังไม่มีใบแจ้งซ่อม
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>วันที่แจ้งซ่อม</TableHead>
                      <TableHead>ผู้แจ้ง</TableHead>
                      <TableHead>รายละเอียด</TableHead>
                      <TableHead className="w-[140px] text-right">
                        จัดการ
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{t.id}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {new Date(t.reported_at).toLocaleString("th-TH", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {t.reporter.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium">
                              {t.reporter}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {t.description}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onEdit(t)}
                              aria-label="แก้ไข"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeletingId(t.id)}
                              aria-label="ลบ"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(o) => !o && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ?</AlertDialogTitle>
            <AlertDialogDescription>
              การลบใบแจ้งซ่อมนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 font-display text-3xl font-semibold text-foreground">
            {value}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15 text-gold">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
