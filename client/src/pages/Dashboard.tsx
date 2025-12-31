import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useLeads, useDeleteLead } from "@/hooks/use-leads";
import { AddLeadDialog } from "@/components/AddLeadDialog";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MoreVertical, 
  Trash2, 
  ArrowRight, 
  Sparkles,
  ExternalLink,
  Radar,
  Target,
  TrendingUp,
  Zap,
  CircleDot,
  CheckCircle2,
  XCircle,
  Clock,
  Filter
} from "lucide-react";

// Pipeline stages for CRM view - matches schema status values: new, qualified, contacted, disqualified
const PIPELINE_STAGES = [
  { id: "all", label: "All", icon: Filter, color: "text-muted-foreground", bgActive: "bg-foreground" },
  { id: "new", label: "New", icon: CircleDot, color: "text-blue-500", bgActive: "bg-blue-500" },
  { id: "qualified", label: "Qualified", icon: TrendingUp, color: "text-accent", bgActive: "bg-accent" },
  { id: "contacted", label: "Contacted", icon: Clock, color: "text-orange-500", bgActive: "bg-orange-500" },
  { id: "disqualified", label: "Disqualified", icon: XCircle, color: "text-red-500", bgActive: "bg-red-500" },
] as const;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: leads, isLoading, error } = useLeads();
  const { mutate: deleteLead } = useDeleteLead();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [, navigate] = useLocation();

  // Filter leads by search and status (case-insensitive)
  const filteredLeads = useMemo(() => {
    return leads?.filter(lead => {
      const matchesSearch = lead.company.toLowerCase().includes(search.toLowerCase()) || 
        lead.description?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || lead.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);
  
  // Count leads by status for pipeline stats
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0, new: 0, qualified: 0, contacted: 0, disqualified: 0 };
    leads?.forEach(lead => {
      counts.all++;
      const status = lead.status.toLowerCase();
      if (counts[status] !== undefined) counts[status]++;
    });
    return counts;
  }, [leads]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-2xl font-bold text-destructive mb-2">Error Loading Leads</h2>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  // Empty state when no leads exist
  if (!leads || leads.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Watchlist</h1>
            <p className="text-muted-foreground mt-1">Monitor and track your target opportunities.</p>
          </div>
        </div>

        {/* Empty State Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-visible glass-strong rounded-3xl border border-border/30 shadow-soft-xl p-8 md:p-12"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl" />
          <div className="absolute top-4 right-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
          
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-soft-lg">
              <Radar className="w-8 h-8 text-white" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Your Watchlist is Empty
              </h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Run your first scan to discover distressed digital assets with untapped MRR potential across 14 marketplaces.
              </p>
            </div>

            <Button 
              size="lg" 
              className="rounded-xl bg-foreground text-background hover:bg-foreground/90 shadow-soft-lg px-8"
              onClick={() => navigate('/hunt')}
              data-testid="button-run-first-scan"
            >
              <Radar className="w-5 h-5 mr-2" />
              Run Your First Scan
            </Button>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Target,
              title: "Find Distressed Assets",
              description: "Discover Chrome extensions, Shopify apps, and SaaS products with 1000+ users but signs of abandonment."
            },
            {
              icon: TrendingUp,
              title: "Calculate MRR Potential",
              description: "AssetHunter-powered valuation estimates revenue potential and suggests acquisition strategies."
            },
            {
              icon: Zap,
              title: "Get Owner Contact Info",
              description: "Hunter tier unlocks email templates and contact details to start negotiations."
            }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-6 glass-card rounded-2xl border border-border/30 shadow-soft space-y-3"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Watchlist</h1>
          <p className="text-muted-foreground mt-1">Monitor and track your target opportunities.</p>
        </div>
        <AddLeadDialog />
      </div>

      {/* Stats Cards */}
      <div className="glass-card rounded-2xl border border-border/30 shadow-soft-lg overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border/30">
          {[
            { label: "Total Leads", value: leads?.length || 0, icon: Target },
            { label: "Qualified", value: leads?.filter(l => l.status === 'qualified').length || 0, icon: TrendingUp },
            { label: "Pending", value: leads?.length || 0, icon: Sparkles },
            { label: "Conv. Rate", value: "12%", icon: Zap },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 text-center"
            >
              <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
              <span className="text-2xl font-bold font-mono text-foreground">{stat.value}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="glass-card rounded-2xl border border-border/30 shadow-soft-lg overflow-hidden">
        {/* Pipeline Filter Tabs */}
        <div className="p-4 border-b border-border/30 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {PIPELINE_STAGES.map((stage) => {
              const count = statusCounts[stage.id] || 0;
              const isActive = statusFilter === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => setStatusFilter(stage.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? "bg-foreground text-background shadow-soft" 
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                  }`}
                  data-testid={`button-filter-${stage.id}`}
                >
                  <stage.icon className={`w-4 h-4 ${isActive ? "" : stage.color}`} />
                  <span>{stage.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-xs ${
                    isActive ? "bg-background/20" : "bg-background/50"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Search Toolbar */}
        <div className="p-4 border-b border-border/30 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              className="pl-10 rounded-xl border-border/60 bg-secondary/30 focus:bg-background transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-leads"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span data-testid="text-results-count">{filteredLeads?.length} results</span>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden p-4 space-y-3">
          {filteredLeads?.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-center">
              No leads found. Start hunting or add one manually!
            </div>
          ) : (
            filteredLeads?.map((lead) => (
              <Link key={lead.id} href={`/leads/${lead.id}`}>
                <div className="p-4 bg-secondary/30 rounded-xl border border-border/50 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {lead.company.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{lead.company}</p>
                        <p className="text-xs text-muted-foreground capitalize">{lead.source}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="shrink-0 rounded-lg h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={(e) => { e.preventDefault(); deleteLead(lead.id); }}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <LeadStatusBadge status={lead.status} />
                    <span className="text-xs text-muted-foreground">
                      {lead.createdAt && format(new Date(lead.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                    No leads found. Start hunting or add one manually!
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads?.map((lead) => (
                  <TableRow key={lead.id} className="group hover:bg-secondary/20 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Link href={`/leads/${lead.id}`}>
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg cursor-pointer">
                            {lead.company.charAt(0).toUpperCase()}
                          </div>
                        </Link>
                        <div>
                          <Link href={`/leads/${lead.id}`}>
                            <p className="font-semibold text-foreground group-hover:text-primary transition-colors cursor-pointer">
                              {lead.company}
                            </p>
                          </Link>
                          {lead.website && (
                            <a 
                              href={lead.website} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-xs text-muted-foreground hover:underline flex items-center gap-1 mt-0.5"
                            >
                              {lead.website.replace(/^https?:\/\//, '')}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <LeadStatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell>
                      <span className="capitalize text-sm text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                        {lead.source}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {lead.createdAt && format(new Date(lead.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/leads/${lead.id}`}>
                          <Button size="sm" variant="ghost" className="hidden group-hover:inline-flex rounded-lg hover:bg-primary/10 hover:text-primary">
                            Details <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="rounded-lg h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => deleteLead(lead.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
