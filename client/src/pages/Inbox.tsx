import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AssetHunterLogo } from "@/components/AssetHunterLogo";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MobileNav } from "@/components/MobileNav";
import { 
  Mail,
  MessageSquare,
  Search,
  Loader2,
  Edit3
} from "lucide-react";
import { SiGooglechrome, SiShopify, SiWordpress, SiSlack, SiFirefox, SiLinkedin } from "react-icons/si";
import { motion } from "framer-motion";
import type { OutreachLog } from "@shared/schema";

function getStatusBadge(status: string) {
  switch (status) {
    case "sent":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Sent</Badge>;
    case "awaiting_reply":
      return <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Awaiting Reply</Badge>;
    case "replied":
      return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Replied</Badge>;
    case "follow_up":
      return <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">Follow-up Needed</Badge>;
    case "closed":
      return <Badge variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Closed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function getChannelIcon(channel: string) {
  switch (channel) {
    case "email":
      return <Mail className="w-4 h-4" />;
    case "linkedin":
      return <SiLinkedin className="w-4 h-4" />;
    default:
      return <MessageSquare className="w-4 h-4" />;
  }
}

function getMarketplaceIcon(marketplace: string) {
  const lower = marketplace.toLowerCase();
  if (lower.includes('chrome')) return SiGooglechrome;
  if (lower.includes('firefox')) return SiFirefox;
  if (lower.includes('shopify')) return SiShopify;
  if (lower.includes('wordpress')) return SiWordpress;
  if (lower.includes('slack')) return SiSlack;
  return SiGooglechrome;
}

function OutreachCard({ 
  log, 
  onUpdateStatus,
  onEditNotes,
  isUpdating 
}: { 
  log: OutreachLog;
  onUpdateStatus: (id: number, status: string) => void;
  onEditNotes: (log: OutreachLog) => void;
  isUpdating: boolean;
}) {
  const Icon = getMarketplaceIcon(log.marketplace);
  const daysSince = log.sentAt ? Math.floor((Date.now() - new Date(log.sentAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  
  return (
    <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-colors w-full max-w-full" data-testid={`card-outreach-${log.id}`}>
      <div className="p-5 overflow-hidden">
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 flex-wrap gap-y-1 min-w-0 flex-1">
            {getStatusBadge(log.status)}
            <Badge variant="outline" className="text-xs border-slate-200 dark:border-slate-700 text-slate-500 shrink-0">
              {getChannelIcon(log.channel)}
              <span className="ml-1 capitalize">{log.channel}</span>
            </Badge>
          </div>
          <div className="text-xs text-slate-400 shrink-0">{daysSince}d ago</div>
        </div>
        
        <div className="flex items-start gap-3 mb-4 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <h3 className="font-semibold text-slate-900 dark:text-white text-base truncate" data-testid={`text-name-${log.id}`}>
              {log.assetName}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
              {log.subject || "Initial outreach"}
            </p>
          </div>
        </div>
        
        {log.notes && (
          <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{log.notes}</p>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Select 
            value={log.status} 
            onValueChange={(value) => onUpdateStatus(log.id, value)}
            disabled={isUpdating}
          >
            <SelectTrigger className="flex-1 text-xs h-8" data-testid={`select-status-${log.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="awaiting_reply">Awaiting Reply</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
              <SelectItem value="follow_up">Follow-up Needed</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-2 border-slate-200 dark:border-slate-700"
            onClick={() => onEditNotes(log)}
            data-testid={`button-edit-${log.id}`}
          >
            <Edit3 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function Inbox() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingLog, setEditingLog] = useState<OutreachLog | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Fetch outreach logs with react-query
  const { data: outreachData, isLoading, error } = useQuery<{ logs: OutreachLog[] }>({
    queryKey: ['/api/outreach'],
    enabled: !!user,
  });
  
  const outreachLogs = outreachData?.logs || [];
  
  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest('PATCH', `/api/outreach/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/outreach'] });
      toast({
        title: "Status updated",
        description: "Outreach status has been updated"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive"
      });
    }
  });
  
  // Update notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      return apiRequest('PATCH', `/api/outreach/${id}`, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/outreach'] });
      setEditingLog(null);
      toast({
        title: "Notes saved",
        description: "Your notes have been saved"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save notes",
        variant: "destructive"
      });
    }
  });
  
  const handleUpdateStatus = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };
  
  const handleSaveNotes = () => {
    if (!editingLog) return;
    updateNotesMutation.mutate({ id: editingLog.id, notes: editNotes });
  };
  
  const filteredLogs = filterStatus === "all" 
    ? outreachLogs 
    : outreachLogs.filter(log => log.status === filterStatus);
  
  const statusCounts = {
    all: outreachLogs.length,
    awaiting_reply: outreachLogs.filter(l => l.status === "awaiting_reply").length,
    replied: outreachLogs.filter(l => l.status === "replied").length,
    follow_up: outreachLogs.filter(l => l.status === "follow_up").length,
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <Mail className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sign In Required</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Please sign in to view your outreach history.
          </p>
          <Link href="/">
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700" data-testid="button-go-home">
              Go to Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden pb-24 lg:pb-8">
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-4">
            <Link href="/" data-testid="link-back-home">
              <div className="flex items-center gap-2 cursor-pointer">
                <AssetHunterLogo size="sm" />
                <span className="font-semibold text-slate-900 dark:text-white">AssetHunter</span>
              </div>
            </Link>
            <Link href="/feed">
              <Button variant="outline" size="sm" className="border-slate-200 dark:border-slate-700" data-testid="link-browse-feed">
                <Search className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Browse Feed</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <Mail className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inbox</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            Track your outreach to asset owners
          </p>
        </motion.div>
        
        {/* Status filter tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: "all", label: "All", count: statusCounts.all },
            { key: "awaiting_reply", label: "Awaiting Reply", count: statusCounts.awaiting_reply },
            { key: "replied", label: "Replied", count: statusCounts.replied },
            { key: "follow_up", label: "Follow-up", count: statusCounts.follow_up },
          ].map(({ key, label, count }) => (
            <Button
              key={key}
              variant={filterStatus === key ? "default" : "outline"}
              size="sm"
              className={`rounded-full shrink-0 ${filterStatus === key 
                ? "bg-indigo-600 text-white" 
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
              }`}
              onClick={() => setFilterStatus(key)}
              data-testid={`button-filter-${key}`}
            >
              {label}
              {count > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs bg-white/20 text-current">{count}</Badge>
              )}
            </Button>
          ))}
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : error ? (
          <Card className="p-12 text-center">
            <Mail className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Failed to load outreach logs
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              There was an error loading your outreach history. Please try again.
            </p>
          </Card>
        ) : filteredLogs.length === 0 ? (
          <Card className="p-12 text-center">
            <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {filterStatus === "all" ? "No outreach yet" : `No ${filterStatus.replace("_", " ")} messages`}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {filterStatus === "all" 
                ? "When you contact asset owners from the Feed, your outreach history will appear here."
                : "Try changing the filter to see other messages."
              }
            </p>
            <Link href="/feed">
              <Button className="bg-indigo-600 text-white hover:bg-indigo-700" data-testid="button-browse-assets">
                Browse Assets
              </Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-slate-500 dark:text-slate-400" data-testid="text-outreach-count">
                <span className="font-medium text-slate-900 dark:text-white">{filteredLogs.length}</span> outreach message{filteredLogs.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLogs.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <OutreachCard 
                    log={log}
                    onUpdateStatus={handleUpdateStatus}
                    onEditNotes={(log) => {
                      setEditingLog(log);
                      setEditNotes(log.notes || "");
                    }}
                    isUpdating={updateStatusMutation.isPending && updateStatusMutation.variables?.id === log.id}
                  />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </main>
      
      <MobileNav />
      
      {/* Edit Notes Dialog */}
      <Dialog open={!!editingLog} onOpenChange={() => setEditingLog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Notes</DialogTitle>
            <DialogDescription>
              Add notes about this outreach conversation
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            placeholder="Add notes about the conversation, follow-up reminders, etc..."
            className="min-h-[120px]"
            data-testid="textarea-notes"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingLog(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveNotes}
              disabled={updateNotesMutation.isPending}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              data-testid="button-save-notes"
            >
              {updateNotesMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Notes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
