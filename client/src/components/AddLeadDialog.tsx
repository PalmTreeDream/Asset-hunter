import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useCreateLead } from "@/hooks/use-leads";
import type { CreateLeadRequest } from "@shared/schema";

export function AddLeadDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateLeadRequest>({
    company: "",
    website: "",
    description: "",
    source: "manual",
    status: "new",
  });

  const { mutate, isPending } = useCreateLead();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(formData, {
      onSuccess: () => {
        setOpen(false);
        setFormData({ company: "", website: "", description: "", source: "manual", status: "new" });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 rounded-xl transition-all hover:-translate-y-0.5">
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-border/50 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Add New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              required
              placeholder="Acme Corp"
              className="rounded-xl border-border/60 focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              placeholder="https://acme.com"
              className="rounded-xl border-border/60 focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={formData.website || ""}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief notes about the lead..."
              className="rounded-xl border-border/60 focus:border-primary focus:ring-4 focus:ring-primary/10 min-h-[100px]"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-semibold"
            >
              {isPending ? "Creating..." : "Create Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
