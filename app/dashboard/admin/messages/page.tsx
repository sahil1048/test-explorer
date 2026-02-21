import { createClient } from "@/lib/supabase/server";
import { Mail, Calendar, Building2, User, Trash2, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import MessageDetailModal from "@/components/admin/MessageDetailModal";
import { revalidatePath } from "next/cache";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  // Fetch all messages with organization details
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*, organizations(name)")
    .order("created_at", { ascending: false });

  // Action to mark as read
  async function markAsRead(id: string) {
    "use server";
    const supabase = await createClient();
    
    // Updates status to 'read' to satisfy the database check constraint
    await supabase.from("contact_messages").update({ status: "read" }).eq("id", id);
    
    // Refreshes the page data immediately
    revalidatePath("/dashboard/admin/messages");
  }

  const selectedMessage = params.id 
    ? messages?.find((m) => m.id === params.id) 
    : null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Inbox</h1>
          <p className="text-slate-500 font-medium">Manage inquiries from all school subdomains.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest">Sender</th>
                <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest">Organization</th>
                <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest">Message</th>
                <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {messages?.map((msg) => (
                <tr 
                  key={msg.id} 
                  className={`hover:bg-slate-50/50 transition-colors ${msg.status === 'unread' ? 'bg-blue-50/30' : 'opacity-60'}`}
                >
                  <td className="p-5">
                    <div className="font-bold text-slate-900">
                      {msg.name} 
                      {msg.status === 'unread' && <span className="ml-2 w-2 h-2 inline-block bg-blue-500 rounded-full animate-pulse" />}
                    </div>
                    <div className="text-xs text-slate-500">{msg.email}</div>
                  </td>
                  <td className="p-5">
                    {msg.organizations?.name ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase">
                        <Building2 className="w-3 h-3" /> {msg.organizations.name}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Platform General</span>
                    )}
                  </td>
                  <td className="p-5 max-w-xs">
                    <p className={`text-sm truncate ${msg.status === 'unread' ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                      {msg.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="p-5 text-right">
                    <Link 
                      href={`/dashboard/admin/messages?id=${msg.id}`}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        msg.status === 'unread' 
                        ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* The Individual Message Dialog/Modal */}
      {selectedMessage && (
        <MessageDetailModal 
          message={selectedMessage} 
          markAsReadAction={markAsRead} 
        />
      )}
    </div>
  );
}